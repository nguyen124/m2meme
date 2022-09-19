(function () {
    const router = require('express').Router(),
        middleware = require('../../util/middleware'),
        functions = require('firebase-functions'),
        fileSvc = require('../services/fileSvc'),
        status = require('http-status');

    router.post('/svc/files/upload', [middleware.isValidUser, fileSvc.middleF1, fileSvc.middleF2], functions.https.onRequest((req, res) => {

    }));

    router.post('/svc/files/delete', (req, res) => {
        var body = req.body;
        fileSvc.deleteByUrl(body.url, body.fileType).then((result)=>{
            return res.status(status.OK).json(result);
        }).catch(err=>{
            return res.status(status.INTERNAL_SERVER_ERROR).json(err);
        });
        
    });
    module.exports = router;
}());