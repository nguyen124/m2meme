(function () {
    var express = require('express'),
        router = express.Router();

    // Define the home page route
    router.get('/svc/share/image', (req, res) => {
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
            '</head><body>' + '<script>window.location="' + req.query.url + '"</script>' +
            '</body></html>';
        res.send(html);
    });

    router.get('/svc/share/video', (req, res) => {
        var html = '<html><head>' +
            '<meta property="og:title" content="' + req.query.title + '">' +
            '<meta property="og:video" content="' + req.query.video + '">' +
            '<meta property="og:video:secure_url" content="' + req.query.video + '">' +
            '<meta property="og:video:type" content="video/mp4">' +
            '<meta property="og:video:width" content="' + 600 + '">' +
            '<meta property="og:video:height" content="' + 314 + '">' +
            '<meta property="og:description" content="' + req.query.description + '">' +
            '<meta property="og:image" content="https://me2meme.com/assets/image/logo256x215.png">' +
            '<meta property="og:url" content="' + req.query.url + '">' +
            '<meta name="twitter:card" content="player">' +
            '<meta name="twitter:title" content="' + req.query.title + '">' +
            '<meta name="twitter:site" content="MasterHai">' +
            '<meta name="twitter:description" content="' + req.query.description + '">' +
            '<meta name="twitter:player" content="' + req.query.video + '">' +
            '<meta name="twitter:player:width" content="' + 600 + '">' +
            '<meta name="twitter:player:height" content="' + 314 + '">' +
            '<meta name="twitter:image" content="https://me2meme.com/assets/image/logo256x215.png">' +
            '</head><body>' + '<script>window.location="' + req.query.url + '"</script>' +
            '</body></html>';
        res.send(html);
    });

    module.exports = router;
}());
