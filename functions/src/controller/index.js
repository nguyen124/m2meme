(function () {
    var express = require('express'),
        router = express.Router();

    // Define the home page route
    router.get('/:id', (req, res) => {
        res.send('<!DOCTYPE html><head>' +
            '<title>' + ' | Me2meme Website</title>' +
            '<meta property="og:title" content="' + '">' +
            '<meta property="twitter:title" content="' + '">' +
            '<link rel="icon" href="https://m2meme.firebaseapp.com/assets/image/logo256x215.png">' +
            '</head><body>' + 'Hello world ' + req.params.id +
            '</body></html>');
    });

    module.exports = router;
}());
