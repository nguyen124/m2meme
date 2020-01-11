(function () {
    var router = require('express').Router(),
        middleware = require('../../util/middleware'),
        os = require('os'),
        path = require('path'),
        Busboy = require('busboy'),
        fs = require('fs'),
        UUID = require("uuid-v4");

    const functions = require('firebase-functions');
    const gcconfig = {
        projectId: 'm2meme',
        keyFilename: 'm2meme-firebase-adminsdk-rvmhz-dff76c1bfa.json'
    }
    const { Storage } = require('@google-cloud/storage');
    const gcs = new Storage(gcconfig);

    router.post('/svc/uploadFile', middleware.isValidUser, functions.https.onRequest((req, res) => {
        if (req.method !== "POST") {
            return res.status(500).json({ message: "Not allowed" });
        }
        const busboy = new Busboy({ headers: req.headers });

        let uploadData = null;
        let uuid = UUID();

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            const filepath = path.join(os.tmpdir(), uuid + filename);
            uploadData = { file: filepath, type: mimetype };
            file.pipe(fs.createWriteStream(filepath));
        });

        busboy.on('finish', () => {
            const bucket = gcs.bucket('m2meme.appspot.com');
            bucket.upload(uploadData.file, {
                uploadType: 'media',
                metadata: {
                    metadata: {
                        contentType: uploadData.type,
                        firebaseStorageDownloadTokens: uuid
                    }
                }
            }).then((data) => {
                let file = data[0];
                return res.status(200).json({ fileLocation: "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid });
            }).catch((err) => {
                res.status(500).json({
                    error: err
                });
            });
        });

        return req.pipe(busboy);
    }));
    module.exports = router;
}());