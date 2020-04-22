(function () {
    var express = require('express'),
        router = express.Router();

    // Define the home page route
    router.get('/', (req, res) => {
        var html = '<html><head>' +
            '<meta property="og:title" content="' + req.query.title + '">' +
            '<meta property="og:image" content="' + req.query.image + '">' +
            '<meta property="og:image:width" content="' + 600 + '">' +
            '<meta property="og:image:height" content="' + 314 + '">' +
            '<meta property="og:description" content="' + req.query.description + '">' +
            '<meta property="og:url" content="' + req.query.url + '">' +
            '<meta name="twitter:card" content="summary_large_image">' +
            '<meta name="twitter:image" content="' + req.query.image + '">' +
            '<meta name="twitter:title" content="' + req.query.title + '">' +
            '<meta name="twitter:description" content="' + req.query.description + '">' +
            '</head><body>' + '<script>window.location="https://me2meme.com/?id=' + req.query.id + '"</script>' +
            '</body></html>';
        res.send(html);
    });

    module.exports = router;
}());
