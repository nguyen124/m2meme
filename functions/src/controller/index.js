(function () {
    var express = require('express'),
        router = express.Router();

    // Define the home page route
    router.get('/', function (req, res) {
        res.send(req.user);
    });

    module.exports = router;
}());
