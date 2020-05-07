(function () {
    const os = require('os'),
        path = require('path'),
        Busboy = require('busboy'),
        fs = require('fs'),
        UUID = require("uuid-v4"),
        getRawBody = require('raw-body'),
        contentType = require('content-type'),
        { Storage } = require('@google-cloud/storage'),
        gcconfig = {
            projectId: 'm2meme',
            keyFilename: 'm2meme-firebase-adminsdk-rvmhz-dff76c1bfa.json'
        },
        gcs = new Storage(gcconfig),
        ffmpegPath = require('@ffmpeg-installer/ffmpeg').path,
        ffmpeg = require('fluent-ffmpeg'),
        environment = require('../../env.json')[process.env.NODE_ENV || 'development'];

    var today = new Date(),
        filePath = today.getFullYear() + "/" + today.getMonth() + "/" + today.getDate() + "/";

    ffmpeg.setFfmpegPath(ffmpegPath);

    module.exports = {
        middleF1: middleF1,
        middleF2: middleF2,
        deleteFile: deleteFile
    };

    function middleF1(req, res, next) {
        if (req.rawBody === undefined &&
            req.method === 'POST' &&
            req.headers['content-type'].startsWith('multipart/form-data')) {
            getRawBody(
                req,
                {
                    length: req.headers['content-length'],
                    limit: '10mb',
                    encoding: contentType.parse(req).parameters.charset,
                },
                (err, string) => {
                    if (err) return next(err);
                    req.rawBody = string;
                    return next();
                }
            );
        }
        return next();
    }

    function middleF2(req, res, next) {
        if (req.method === 'POST' &&
            req.headers['content-type'].startsWith('multipart/form-data')) {
            let uuid = UUID();
            const busboy = new Busboy({
                headers: req.headers,
            });

            var fileBuffer = new Buffer('');
            req.data = {};
            busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                filename = filename.trim();
                file.on('data', data => {
                    fileBuffer = Buffer.concat([fileBuffer, data]);
                });

                file.on('end', () => {
                    const file_object = {
                        fieldname,
                        originalname: filename,
                        encoding,
                        mimetype,
                        buffer: fileBuffer,
                    };
                    req.file = file_object;
                });
                const filepath = path.join(os.tmpdir(), uuid + path.extname(filename));
                req.data.file = filepath;
                file.pipe(fs.createWriteStream(filepath));
            });

            busboy.on('field', (fieldname, val) => {
                req.data[fieldname] = val;
            });

            busboy.on('finish', () => {
                const bucket = gcs.bucket(environment.FIREBASE_BUCKET);
                //convert other video type to mp4 to support safari and other less popular browser
                if (req.file.mimetype === 'video/mp4') {
                    return ensureCodeMp4IsLibx264(res, bucket, req.data.file);
                } else {
                    bucket.upload(req.data.file, {
                        uploadType: 'media',
                        destination: filePath + path.basename(req.data.file)
                    }).then(uploadedNonMp4File => {
                        if (req.file.mimetype.startsWith('video')) {
                            return createMp4FromNoneMp4(res, bucket, uploadedNonMp4File, req.data.file);
                        } else {
                            return makeFilePublic(bucket, uploadedNonMp4File).then(() => {
                                return res.status(200).json({
                                    fileLocation: environment.FILE_LOCATION + uploadedNonMp4File[0].name,
                                    filename: uploadedNonMp4File[0].name
                                });
                            });
                        }
                    }).catch(err => {
                        console.log(err);
                        return res.status(500).json(err);
                    });
                }
            });
            busboy.end(req.rawBody);
            req.pipe(busboy);
        }
        return next();
    }

    /*
    *    Ensure mp4 file playable on safari and other browsers
    */
    function ensureCodeMp4IsLibx264(res, bucket, mp4Format) {
        var newMp4Format = mp4Format.replace(/\.[^.]+$/, "_new.mp4");
        convertFile(mp4Format, newMp4Format).then(() => {
            return bucket.upload(newMp4Format, {
                uploadType: 'media',
                destination: filePath + path.basename(mp4Format)
            });
        }).then(uploadedFile => {
            unlinkFile(mp4Format);
            unlinkFile(newMp4Format);
            return makeFilePublic(bucket, uploadedFile).then(() => {
                return res.status(200).json({
                    fileLocation: environment.FILE_LOCATION + uploadedFile[0].name,
                    filename: uploadedFile[0].name
                });
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json(err);
        });
    }

    /*
    *   If user upload other types of video different then mp4 then we need to create mp4 file
    */
    function createMp4FromNoneMp4(res, bucket, uploadedNonMp4File, nonMp4Format) {
        const mp4Format = nonMp4Format.replace(/\.[^.]+$/, ".mp4");
        convertFile(nonMp4Format, mp4Format).then(() => {
            return bucket.upload(mp4Format, {
                uploadType: 'media',
                destination: filePath + path.basename(mp4Format)
            });
        }).then(uploadedSecondFile => {
            unlinkFile(mp4Format);
            unlinkFile(nonMp4Format);
            makeFilePublic(bucket, uploadedSecondFile);
            return makeFilePublic(bucket, uploadedNonMp4File);
        }).then(() => {
            return res.status(200).json({
                fileLocation: environment.FILE_LOCATION + uploadedNonMp4File[0].name,
                filename: uploadedNonMp4File[0].name
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json(err);
        });
    }

    function convertFile(input, output) {
        return new Promise((resolve, reject) => {
            console.log("Entering converting file");
            ffmpeg(input)
                .format("mp4")
                .videoCodec("libx264")
                .on('error', function (err) {
                    console.log("Error in converting file");
                    reject(err);
                })
                .on('end', function () {
                    console.log("Success in converting file");
                    resolve(output);
                }).saveToFile(output);
        });
    }

    function makeFilePublic(bucket, uploadedFile) {
        let file = uploadedFile[0];
        var fileName = file.name;
        var theFile = bucket.file(fileName);
        return theFile.makePublic();
    }

    function unlinkFile(pathToTempFile) {
        fs.unlinkSync(pathToTempFile);
    }

    function deleteFile(filename) {
        // Create a reference to the file to delete
        return gcs.bucket(environment.FIREBASE_BUCKET).file(filename).delete();
    }
}());