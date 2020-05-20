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
                bucket.upload(req.data.file, {
                    uploadType: 'media',
                    destination: filePath + path.basename(req.data.file),
                    resumable: false,
                    public: true,
                    metadata: { gzip: true, cacheControl: "public, max-age=31536000" }
                }).then(uploadedNonMp4File => {
                    fs.unlinkSync(req.data.file);
                    return res.status(200).json({
                        fileLocation: environment.FILE_LOCATION + uploadedNonMp4File[0].name,
                        filename: uploadedNonMp4File[0].name
                    });
                }).catch(err => {
                    console.log(err);
                    return res.status(500).json(err);
                });
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

    function deleteFile(filename, fileType) {
        // Create a reference to the file to delete
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
        }
        return bucket.file(filename).delete();
    }

    function deleteByUrl(url, fileType) {
        var filename = url.replace(environment.FILE_LOCATION, '');
        deleteFile(filename, fileType);
    }
}());