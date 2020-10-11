(function () {
    const os = require('os'),
        path = require('path'),
        Busboy = require('busboy'),
        fs = require('fs'),
        getRawBody = require('raw-body'),
        contentType = require('content-type'),
        { Storage } = require('@google-cloud/storage'),
        //ffmpegPath = require('@ffmpeg-installer/ffmpeg').path,
        //ffmpeg = require('fluent-ffmpeg'),
        environment = require('../../env.json')[process.env.NODE_ENV || 'development'],
        MAX_FILE = environment.MAX_FILE,
        gcconfig = {
            projectId: environment.projectId,
            keyFilename: environment.keyFileName
        },
        gcs = new Storage(gcconfig);
    //{ exec } = require("child_process");

    let today = new Date(),
        filePath = today.getFullYear() + "/" + today.getMonth() + "/" + today.getDate() + "/";

    //ffmpeg.setFfmpegPath(ffmpegPath);

    module.exports = {
        middleF1: middleF1,
        middleF2: middleF2,
        deleteFile: deleteFile,
        deleteByUrl: deleteByUrl
    };

    function middleF1(req, res, next) {
        if (req.rawBody === undefined &&
            req.method === 'POST' &&
            req.headers['content-type'].startsWith('multipart/form-data')) {
            getRawBody(
                req,
                {
                    length: req.headers['content-length'],
                    limit: MAX_FILE + 'mb',
                    encoding: contentType.parse(req).parameters.charset,
                },
                (err, string) => {
                    if (err) {
                        console.log("Error: " + err);
                        return next(err);
                    }
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
            const busboy = new Busboy({
                headers: req.headers,
                limits: {
                    fileSize: MAX_FILE * 1024 * 1024
                }
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
                const filepath = path.join(os.tmpdir(), req.user.username + "_" + filename);
                req.data.file = filepath;
                req.data.fileName = filename;
                file.pipe(fs.createWriteStream(filepath));
            });

            busboy.on('field', (fieldname, val) => {
                req.data[fieldname] = val;
            });

            busboy.on('finish', () => {
                const bucket = gcs.bucket(environment.FIREBASE_BUCKET);
                let destination = filePath + req.user.username + "/";

                bucket.upload(req.data.file, {
                    uploadType: 'multipart',
                    destination: destination + req.data.fileName,
                    resumable: false,
                    metadata: { gzip: true, cacheControl: "public, max-age=31536000" }
                }).then(async uploadedNonMp4File => {
                    //if (req.file.mimetype.startsWith('video')) {
                        // await createPoster(bucket, destination, path, req.user.username, req.data.fileName, req.data.file);
                        fs.unlinkSync(req.data.file);
                    //}
                    return res.end();
                }).catch(err => {
                    console.log("Upload error: " + err);
                    return res.status(500).json(err);
                });

                return res.write(JSON.stringify({
                    fileLocation: environment.FILE_LOCATION + destination + req.data.fileName,
                    filename: req.data.fileName
                }));
            });
            if (process.env.NODE_ENV) {
                busboy.end(req.rawBody); // only on production
            }
            req.pipe(busboy);
        }
        if (process.env.NODE_ENV) {
            return next(); // only on production
        }
    }

    // async function createPoster(bucket, destination, path, username, fileName, tempLocalFile) {
    //     const gifPosterPath = fileName.replace(/\.[^/.]+$/, '_poster.jpg');
    //     const posterPath = path.join(os.tmpdir(), username + "_" + gifPosterPath);
    //     await createPosterFromVideo(tempLocalFile, posterPath);
    //     await bucket.upload(posterPath, {
    //         destination: destination + gifPosterPath,
    //         uploadType: 'media',
    //         resumable: false,
    //         metadata: { gzip: true, cacheControl: "public, max-age=31536000" }
    //     });
    //     fs.unlinkSync(posterPath);
    // }

    // function createPosterFromVideo(input, output) {
    //     return new Promise((resolve, reject) => {
    //         ffmpeg(input)
    //             .seek(1)
    //             .frames(1)
    //             .on('error', (err) => {
    //                 console.log("Error in create poster: " + err);
    //                 reject(err);
    //             })
    //             .on('end', () => {
    //                 //console.log("Success in create poster");
    //                 resolve(output);
    //             })
    //             .saveToFile(output);
    //         //DONOT DELETE THIS COMMENT
    //         // exec('ffmpeg -t 2.5 -i ' + input + ' -filter_complex "[0:v] fps=5,scale=w=480:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1" ' + output, (error, stdout) => {
    //         //     if (error) {
    //         //         console.log(`error: ${error.message}`);
    //         //         reject(error);
    //         //         return;
    //         //     }
    //         //     resolve(output);
    //         //     console.log(`stdout: ${stdout}`);
    //         // });
    //     });
    // }

    function deleteFile(filename, fileType) {
        // Create a reference to the file to delete
        if (filename) {
            const basename = path.basename(filename);
            const dir = path.dirname(filename);
            const THUMB_PREFIX = 'thumb_'
            const bucket = gcs.bucket(environment.FIREBASE_BUCKET);
            if (fileType.startsWith('image')) {
                var thumb_file_name = `${THUMB_PREFIX}${basename}`;
                bucket.file(dir + "/" + thumb_file_name).delete();
            } else if (fileType.startsWith('video')) {
                var mp4_file = filename.replace(/\.[^.]+$/, "_output.mp4");
                bucket.file(mp4_file).delete();
                var mp4_file_thumb = filename.replace(/\.[^.]+$/, "_thumb_output.mp4");
                bucket.file(mp4_file_thumb).delete();
                var poster = filename.replace(/\.[^.]+$/, "_poster.jpg");
                bucket.file(poster).delete();
                var posterGif = filename.replace(/\.[^.]+$/, "_poster.gif");
                bucket.file(posterGif).delete();
            }
            return bucket.file(filename).delete();
        }
        return null;
    }

    function deleteByUrl(url, fileType) {
        var filename = url.replace(environment.FILE_LOCATION, '');
        deleteFile(filename, fileType);
    }
}());