(function () {
  var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
    FacebookStrategy = require("passport-facebook").Strategy,
    LocalStrategy = require("passport-local").Strategy,
    moment = require("moment"),
    User = require("../model/user"),
    environment =
      require("../../env.json")[process.env.NODE_ENV || "development"],
    host = environment.host;

  var passportConfig = function (passport) {
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
      User.findById(id, (err, user) => {
        done(err, user);
      });
    });

    passport.use(
      "local",
      new LocalStrategy(
        {
          usernameField: "email",
          passwordField: "password",
          passReqToCallback: true,
        },
        (req, email, password, done) => {
          User.findOne(
            { $or: [{ email: email }, { username: email }] },
            {
              email: 1,
              password: 1,
              avatar: 1,
              username: 1,
              familyName: 1,
              givenName: 1,
              joinedDate: 1,
              gender: 1,
              nationality: 1,
              dob: 1,
              role: 1,
              status: 1,
            },
            (err, user) => {
              if (err) {
                return done(err);
              } else if (!user || !user.isValid(password)) {
                return done(null, false, "Incorrect username or password!");
              }
              return done(null, user);
            }
          );
        }
      )
    );

    passport.use(
      new GoogleStrategy(
        {
          clientID:
            "325839050136-uujn1lk8v9ob775gujape3nd420hjppe.apps.googleusercontent.com",
          clientSecret: "GKfVQghfAYBmXhvGbb0oLftZ",
          callbackURL: host + "svc/users/google-auth-callback",
        },
        (accessToken, refreshToken, profile, done) => {
          saveGoogleUser(accessToken, refreshToken, profile, done);
        }
      )
    );

    passport.use(
      new FacebookStrategy(
        {
          clientID: "737995523963189",
          clientSecret: "71fe6ae0d4493b941ba320251fc72958",
          callbackURL: host + "svc/users/facebook-auth-callback",
          profileFields: ["email", "name", "displayName", "photos"],
        },
        (accessToken, refreshToken, profile, done) => {
          saveFacebookUser(accessToken, refreshToken, profile, done);
        }
      )
    );
  };

  function saveGoogleUser(accessToken, refreshToken, profile, done) {
    User.findOne(
      { email: profile.emails[0].value },
      {
        email: 1,
        avatar: 1,
        username: 1,
        familyName: 1,
        givenName: 1,
        joinedDate: 1,
        gender: 1,
        nationality: 1,
        dob: 1,
      },
      {},
      async (err, user) => {
        if (err) {
          return done(err);
        } else if (user) {
          return done(null, user);
        } else {
          var newUser = new User({
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            username: profile.displayName,
            familyName: profile.name.familyName,
            givenName: profile.name.givenName,
            joinedDate: moment().format("YYYY-MM-DD HH:mm:ss Z"),
            modifiedDate: moment().format("YYYY-MM-DD HH:mm:ss Z"),
            role: "USER",
            status: "ACTIVE",
          });
          var newCreatedUser = await User.create(newUser);
          return done(null, newCreatedUser);
        }
      }
    );
  }

  function saveFacebookUser(accessToken, refreshToken, profile, done) {
    User.findOne(
      { email: profile._json.email },
      {
        email: 1,
        avatar: 1,
        username: 1,
        givenName: 1,
        familyName: 1,
        joinedDate: 1,
        gender: 1,
        nationality: 1,
        dob: 1,
      },
      {},
      async (err, user) => {
        if (err) {
          return done(err);
        } else if (user) {
          return done(null, user);
        } else {
          var newUser = new User({
            email: profile._json.email,
            avatar: profile._json.picture.data.url,
            username: profile._json.name,
            givenName: profile._json.first_name,
            familyName: profile._json.last_name,
            joinedDate: moment().format("YYYY-MM-DD"),
            role: "USER",
            status: "ACTIVE",
          });
          var newCreatedUser = await User.create(newUser);
          return done(null, newCreatedUser);
        }
      }
    );
  }
  module.exports = passportConfig;
})();
