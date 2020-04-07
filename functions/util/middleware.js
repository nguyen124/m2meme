(function () {
    var status = require('http-status');

    function isValidUser(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            return res.status(status.UNAUTHORIZED).json("Unauthorized request");
        }
    }

    function isAdmin(req, res, next) {
        if (req.isAuthenticated() && req.user.role === "ADMIN") {
            return next();
        } else {
            return res.status(status.UNAUTHORIZED).json("Unauthorized request");
        }
    }

    module.exports = {
        isValidUser: isValidUser,
        isAdmin: isAdmin
    };
}());