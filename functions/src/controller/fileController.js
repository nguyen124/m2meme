(function () {
    var router = require('express').Router(),
        request = require('request'),
        middleware = require('../../util/middleware');

    router.post('/svc/uploadFile', middleware.isValidUser, function (req, res) {
        var newUrl = 'https://us-central1-architect-c592d.cloudfunctions.net/uploadFile';
        req.pipe(request(newUrl)).pipe(res);
    });
    module.exports = router;
}());