//remmber to set Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass before running deploy
(function () {
    var express = require('express'),
        mongoose = require('mongoose'),
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

    var getExpressInstance = () => {
        var app = express();
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
        return app;
    }

    // app.use(require('prerender-node').set('prerenderToken', 'de3yrhaaRPZXl1df3a3k'));
    var app = getExpressInstance();
    app.use(require('./src/controller/index'));
    if (!process.env.NODE_ENV) {
        app.use(require('./src/controller/itemController'));
        app.use(require('./src/controller/commentController'));
        app.use(require('./src/controller/userController'));
        app.use(require('./src/controller/reportController'));
        app.use(require('./src/controller/notificationController'));
        app.use(require('./src/controller/fileController'));
        app.use(require('./src/controller/checkoutController'));
        app.listen(3000);
        console.log("listening port 3000");
    }
    var itemController = getExpressInstance();
    itemController.use(require('./src/controller/itemController'));
    var commentController = getExpressInstance();
    commentController.use(require('./src/controller/commentController'));
    var userController = getExpressInstance();
    userController.use(require('./src/controller/userController'));
    var reportController = getExpressInstance();
    reportController.use(require('./src/controller/reportController'));
    var notificationController = getExpressInstance();
    notificationController.use(require('./src/controller/notificationController'));
    var fileController = getExpressInstance();
    fileController.use(require('./src/controller/fileController'));
    var checkoutController = getExpressInstance();
    checkoutController.use(require('./src/controller/checkoutController'));

    exports.app = functions.https.onRequest(app);
    exports.itemController = functions.https.onRequest(itemController);
    exports.commentController = functions.https.onRequest(commentController);
    exports.userController = functions.https.onRequest(userController);
    exports.reportController = functions.https.onRequest(reportController);
    exports.notificationController = functions.https.onRequest(notificationController);
    exports.fileController = functions.https.onRequest(fileController);
    exports.checkoutController = functions.https.onRequest(checkoutController);
}());