
(function () {
    var express = require('express'),
        app = express(),
        mongoose = require('mongoose'),
        port = 3000,
        cors = require('cors'),
        passport = require('passport'),
        passportCfg = require('./src/config/passport'),
        session = require('express-session'),
        flash = require('connect-flash'),
        cookieParser = require('cookie-parser'),
        environment = require('./env.json')[process.env.NODE_ENV || 'development'];

    const functions = require('firebase-functions');
    const MongoStore = require('connect-mongo')(session);
    passportCfg(passport);
    // connect to mongoose
    mongoose.connect(environment.MONGO_URI, { useNewUrlParser: true });
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    var db = mongoose.connection;
    //Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    app.use(cors({
        origin: ['https://m2meme.firebaseapp.com', 'https://m2meme-dev.web.app', 'httt://localhost:4200', 'http://127.0.0.1:4200'],
        credentials: true
    }));
    app.use(express.json({ limit: environment.MAX_FILE + 'mb' }));
    app.use(express.urlencoded({ limit: environment.MAX_FILE + 'mb', extended: true }));
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
    // app.use(require('prerender-node').set('prerenderToken', 'de3yrhaaRPZXl1df3a3k'));
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