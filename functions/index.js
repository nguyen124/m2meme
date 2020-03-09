
(function () {
    var express = require('express'),
        app = express(),
        bodyParser = require('body-parser'),
        mongoose = require('mongoose'),
        port = 3000,
        cors = require('cors'),
        passport = require('passport'),
        passportCfg = require('./src/config/passport'),
        session = require('express-session'),
        flash = require('connect-flash'),
        cookieParser = require('cookie-parser');

    const functions = require('firebase-functions');
    const MongoStore = require('connect-mongo')(session);
    passportCfg(passport);
    // connect to mongoose
    mongoose.connect('mongodb+srv://admin:Nguy3nH0H@1@cluster0-wq5um.gcp.mongodb.net/architect?retryWrites=true&w=majority', { useNewUrlParser: true });
    //mongoose.connect('mongodb://localhost/architect', { useNewUrlParser: true });
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    var db = mongoose.connection;
    //Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    app.use(cors({
        origin: ['https://m2meme.firebaseapp.com', 'httt://localhost:4200', 'http://127.0.0.1:4200'],
        credentials: true
    }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(session({
        name: '__session',
        secret: 'haiyeuthanh',
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: false,
            secure: false
        },
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(require('./src/controller/index'));
    app.use(require('./src/controller/itemController'));
    app.use(require('./src/controller/commentController'));
    app.use(require('./src/controller/userController'));
    app.use(require('./src/controller/reportController'));
    app.use(require('./src/controller/notificationController'));
    app.use(require('./src/controller/fileController'));
    app.listen(port);
    console.log('Running on port:' + port);
    exports.app = functions.https.onRequest(app);
}());