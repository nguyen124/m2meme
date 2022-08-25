(function () {
    var mongoose = require('mongoose'),
        bcrypt = require('bcryptjs'),
        Schema = mongoose.Schema,
        userSchema = new Schema({
            email: {
                type: String,
                maxlength: 50,
                minlength: 6
            },
            avatar: {
                type: String,
                maxlength: 1024
            },
            filename: {
                type: String,
                maxlength: 256
            },
            username: {
                type: String,
                minlength: 1,
                maxlength: 50
            },
            familyName: {
                type: String,
                maxlength: 50
            },
            givenName: {
                type: String,
                maxlength: 50
            },
            gender: {
                type: String,
                maxlength: 50
            },
            nationality: {
                type: String,
                maxlength: 50
            },
            password: {
                type: String,
                maxlength: 60,
                minlength: 6
            },
            resetPasswordToken: {
                type: String,
                maxlength: 512
            },
            resetPasswordExpires: Date,
            activateAccountExpires: {
                type: Date,
                expires: 900,
            },
            dob: Date,
            joinedDate: Date,
            modifiedDate: Date,
            rank: {
                type: String,
                maxlength: 20
            },
            status: {
                type: String,
                maxlength: 24
            },
            noOfFollowers: Number,
            googleId: {
                type: String,
                maxlength: 128
            },
            accessToken: {
                type: String,
                maxlength: 512
            },
            role: {
                type: String,
                maxlength: 24
            }
        });

    userSchema.statics.hashPassword = function hashPassword(password) {
        return bcrypt.hashSync(password, 10);
    };
    userSchema.methods.isValid = function (hashPassword) {
        return bcrypt.compareSync(hashPassword, this.password);
    };

    userSchema.index({ username: 1, email: 1 });
    module.exports = mongoose.model('user', userSchema);
}());