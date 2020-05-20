(function () {
    const router = require('express').Router(),
        middleware = require('../../util/middleware'),
        functions = require('firebase-functions'),
        fileSvc = require('../services/fileSvc'),
        status = require('http-status');

    router.post('/svc/uploadFile', [middleware.isValidUser, fileSvc.middleF1, fileSvc.middleF2], functions.https.onRequest((req, res) => {

    }));

    router.post('/svc/deleteFile', (req, res) => {
        var body = req.body;
        fileSvc.deleteByUrl(body.url, body.fileType);
        return res.status(status.OK);
    })
    module.exports = router;
}());