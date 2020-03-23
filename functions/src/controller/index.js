(function () {
    var express = require('express'),
        router = express.Router();

    // Define the home page route
    router.get('/', (req, res) => {
        var html = '<!DOCTYPE html><head>' +
            '<meta property="og:title" content="' + req.query.title + '">' +
            '<meta property="og:image" content="' + req.query.image + '">' +
            '<meta property="og:description" content="' + req.query.description + '">' +
            '<meta property="og:url" content="' + req.query.url + '">' +
            '</head><body>' + 'Hello world ' + req.query.title +
            '</body></html>';
        console.log(html);
        res.send(html);
    });

    module.exports = router;
}());
