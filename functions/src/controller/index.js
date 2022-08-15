(function () {
    var express = require('express'),
        router = express.Router(),
        itemSvc = require('../services/itemSvc'),
        environment = require('../../env.json')[process.env.NODE_ENV || 'development'],
        host = environment.host;

    // Define the home page route
    router.get('/svc/share/image', (req, res) => {
        var html = '<html><head>' +
            '<meta property="og:title" content="' + req.query.title + '">' +
            '<meta property="og:image" content="' + req.query.image + '">' +
            '<meta property="og:image:width" content="' + 600 + '">' +
            '<meta property="og:image:height" content="' + 314 + '">' +
            '<meta property="og:description" content="' + req.query.description + '">' +
            '<meta name="twitter:card" content="summary_large_image">' +
            '<meta name="twitter:image" content="' + req.query.image + '">' +
            '<meta name="twitter:title" content="' + req.query.title + '">' +
            '<meta name="twitter:description" content="' + req.query.description + '">' +
            '</head><body>' + '<script>window.location="' + req.query.url + '"</script>' +
            '</body></html>';
        res.send(html);
    });

    router.get('/svc/metatags', (req, res) => {
        var itemId = req.query.id;
        var conditions = {
            _id: itemId
        }
        itemSvc.getOneItem(conditions).then(item => {
            if (item) {
                var fileType = item.files[0].fileType;
                var imageLink = item.files[0].url;
                if (fileType.startsWith('video')) {
                    imageLink = imageLink.replace(/\.[^.]+$/, "_poster.jpg");
                }
                var html =
                    '<html><head><meta property="og:title" content="' + item.title +
                    '"><meta property="og:url" content="' + host + 'svc/metatags?id=' + itemId +
                    '"><meta property="fb:app_id" content="2341935745914929' +
                    '"><meta property="og:type" content="website' +
                    '"><meta property="og:image" content="' + imageLink +
                    '"><meta property="og:image:width" content="' + 1200 +
                    '"><meta property="og:image:height" content="' + 630 +
                    '"><meta property="og:description" content="' + item.description +
                    '"><meta name="twitter:card" content="summary_large_image' +
                    '"><meta name="twitter:image" content="' + imageLink +
                    '"><meta name="twitter:title" content="' + item.title +
                    '"><meta name="twitter:description" content="' + item.description +
                    '"></head><body><script>window.location="' + environment.host + '/business?id=' + item.id + '"</script></body></html>';
                return res.send(html);
            } else {
                var defaultHtml = '<html><head></head><body><script>window.location="' + host + '"</script></body></html>';
                return res.send(defaultHtml);
            }
        }).catch(err => {
            console.log(err);
        });
    });

    module.exports = router;
}());
