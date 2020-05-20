(function () {
    var router = require('express').Router(),
        userSvc = require('../services/userSvc'),
        middleware = require('../../util/middleware'),
        passport = require('passport'),
        status = require('http-status'),
        moment = require('moment'),
        functions = require('firebase-functions'),
        fileSvc = require('../services/fileSvc');


    //********************USER*********************** */

    /** Update profile of a user */
    router.put('/svc/users/:_id', middleware.isValidUser, (req, res) => {
        var id = req.params._id,
            conditions = {
                _id: id
            },
            newUserInfo = req.body,
            options = {
                projection: {
                    _id: true,
                    username: true,
                    gender: true,
                    dob: true,
                    nationality: true,
                    avatar: true
                },
                new: true
            };

        userSvc.updateUser(conditions, newUserInfo, options).then(newUser => {
            if (newUserInfo.hasAvatarChanged) {
                fileSvc.deleteByUrl(req.user.avatar, 'image/')
            }
            return res.status(status.OK).json(newUser);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /** Logout user */
    router.post('/svc/user/logout', middleware.isValidUser, (req, res) => {
        req.logout();
        return res.status(status.OK).json({ status: "LOGOUT_DONE" });
    });

    /* Register user*/
    router.post('/svc/user/register', (req, res) => {
        if (!req.body.passwords.password ||
            !req.body.passwords.confirmPassword ||
            (req.body.passwords.password !== req.body.passwords.confirmPassword)) {
            return res.status(status.NOT_IMPLEMENTED).json("Passwords are not qualified!");
        }
        if (!req.body.username || !req.body.email) {
            return res.status(status.NOT_IMPLEMENTED).json("Username and email have to be entered!");
        }
        var user = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.passwords.password,
            avatar: '../../assets/image/default-avatar.png',
            joinedDate: moment().format("YYYY-MM-DD HH:mm:ss Z")
        };
        return userSvc.registerUser(user).then(newUser => {
            return res.status(status.OK).json(newUser);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /* Request Reset password*/
    router.post('/svc/requestResetPassword', (req, res) => {
        return userSvc.requestResetPassword(req.body).then(isTempPassSent => {
            return res.status(status.OK).json(isTempPassSent);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /* Reset password*/
    router.post('/svc/resetPassword', (req, res) => {
        if (!req.body.password ||
            !req.body.confirmPassword ||
            (req.body.password !== req.body.confirmPassword)) {
            return res.status(status.NOT_IMPLEMENTED).json("Passwords are not qualified!");
        }
        return userSvc.resetPassword(req.body).then(isPasswordResetOk => {
            return res.status(status.OK).json(isPasswordResetOk);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /** Login user with local auth */
    router.post('/svc/user/auth/local', functions.https.onRequest((req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.status(status.NOT_IMPLEMENTED).json(err);
            } else if (!user) {
                return res.status(status.UNAUTHORIZED).json(info);
            }
            return req.logIn(user, (err) => {
                if (err) {
                    return res.status(status.NOT_IMPLEMENTED).json(err);
                }
                return res.status(status.OK).json({
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        joinedDate: user.joinedDate,
                        avatar: user.avatar,
                        familyName: user.familyName,
                        givenName: user.givenName,
                        gender: user.gender,
                        nationality: user.nationality,
                        dob: user.dob,
                        role: user.role
                    }
                });
            });
        })(req, res, next);
    }));

    /* Google login. This route navigate user to google authentication page */
    router.get('/svc/user/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    /* Google login. This route navigate user to google authentication page */
    router.get('/svc/user/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

    //Google login. This route navigate user to back to application after google authenticated successfully
    router.get('/svc/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
        res.redirect("/savelogin?user=" + encodeURIComponent(JSON.stringify(req.user)));
    });

    //Google login. This route navigate user to back to application after google authenticated successfully
    router.get('/svc/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
        res.redirect("/savelogin?user=" + encodeURIComponent(JSON.stringify(req.user)));
    });

    module.exports = router;
}());