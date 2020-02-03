(function () {
    const router = require('express').Router(),
        middleware = require('../../util/middleware'),
        functions = require('firebase-functions'),
        fileSvc = require('../services/fileSvc');

    router.post('/svc/uploadFile', [middleware.isValidUser, fileSvc.middleF1, fileSvc.middleF2], functions.https.onRequest((req, res) => {

    }));

    module.exports = router;
}());