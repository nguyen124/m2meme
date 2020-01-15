(function () {
    const router = require('express').Router(),
        middleware = require('../../util/middleware'),
        os = require('os'),
        path = require('path'),
        Busboy = require('busboy'),
        fs = require('fs'),
        UUID = require("uuid-v4"),
        getRawBody = require('raw-body'),
        contentType = require('content-type'),
        functions = require('firebase-functions'),
        { Storage } = require('@google-cloud/storage');

    let uuid = UUID();

    router.post('/svc/uploadFile', [middleware.isValidUser, middleF1, middleF2], functions.https.onRequest((req, res) => {

    }));

    function middleF1(req, res, next) {
        if (
            req.rawBody === undefined &&
            req.method === 'POST' &&
            req.headers['content-type'].startsWith('multipart/form-data')
        ) {
            console.log("middleF1");
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
            )
        }
        return next();

    }

    function middleF2(req, res, next) {
        if (
            req.method === 'POST' &&
            req.headers['content-type'].startsWith('multipart/form-data')
        ) {
            console.log("middleF2");
            const gcconfig = {
                projectId: 'm2meme',
                keyFilename: 'm2meme-firebase-adminsdk-rvmhz-dff76c1bfa.json'
            },
                gcs = new Storage(gcconfig),
                busboy = new Busboy({
                    headers: req.headers,
                });

            var fileBuffer = new Buffer('');
            req.data = {};
            busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                file.on('data', data => {
                    fileBuffer = Buffer.concat([fileBuffer, data])
                })

                file.on('end', () => {
                    const file_object = {
                        fieldname,
                        originalname: filename,
                        encoding,
                        mimetype,
                        buffer: fileBuffer,
                    }
                    req.file = file_object
                })
                const filepath = path.join(os.tmpdir(), uuid + filename);
                req.data['file'] = filepath;
                file.pipe(fs.createWriteStream(filepath));
                console.log("On end: " + req.file);
            })

            busboy.on('field', (fieldname, val) => {
                req.data[fieldname] = val;
                console.log("On field: " + req.data[fieldname]);
            })

            busboy.on('finish', () => {
                const bucket = gcs.bucket('m2meme.appspot.com');
                bucket.upload(req.data['file'], {
                    uploadType: 'media',
                    metadata: {
                        metadata: {
                            firebaseStorageDownloadTokens: uuid
                        }
                    }
                }).then((data) => {
                    let file = data[0];
                    fs.unlinkSync(req.data['file']);
                    console.log("On finish: " + file.name);
                    return res.status(200).json({ fileLocation: "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid });
                }).catch((err) => {
                    console.log(err);
                    return res.status(500).json(err);
                });
            })
            busboy.end(req.rawBody);
            req.pipe(busboy);
        }
        return next();
    }

    module.exports = router;
}());