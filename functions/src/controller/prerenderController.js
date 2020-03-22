(function () {
    const router = require('express').Router(),
        functions = require('firebase-functions'),
        admin = require('firebase-admin'),
        request = require('request');


    router.get('/svc/prerender', functions.https.onRequest((req, res) => {
        // var newurl = 'http://localhost:3001/https://www.google.com';
        // return request(newurl).pipe(res);
        const path = req.path.split('/');
        const id = '123';
        const htmlString = buildHtmlWithPost({title: 'hehe', id: '12'});
        return res.status(200).end(htmlString);
    }));


    function buildHtmlWithPost(post) {
        const string = '<!DOCTYPE html><head>' +
            '<title>' + post.title + ' | Me2meme Website</title>' +
            '<meta property="og:title" content="' + post.title + '">' +
            '<meta property="twitter:title" content="' + post.title + '">' +
            '<link rel="icon" href="https://m2meme.firebaseapp.com/assets/image/logo256x215.png">' +
            '</head><body>' +
            '<script>window.location="https://m2meme.firebaseapp.com/?id=' + post.id + '";</script>' +
            '</body></html>';
        return string;
    }

    module.exports = router;
}());