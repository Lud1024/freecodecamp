module.exports = function (app, myDataBase) {
  const passport = require('passport');
  const bcrypt = require('bcrypt');
  const { ObjectID } = require('mongodb');
  const LocalStrategy = require('passport-local');
  const GitHubStrategy = require('passport-github').Strategy;

  // Configurar serialización y deserialización con base de datos
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      if (err) {
        console.error('Database error:', err);
        return done(err);
      }
      done(null, doc);
    });
  });

  // Configurar estrategia de autenticación local
  passport.use(new LocalStrategy((username, password, done) => {
    myDataBase.findOne({ username: username }, (err, user) => {
      console.log(`User ${username} attempted to log in.`);
      if (err) return done(err);
      if (!user) return done(null, false);
      // Compare the provided password with the hashed password
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false);
      }
      return done(null, user);
    });
  }));

  // Configurar estrategia de autenticación con GitHub
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    // Database logic to find or create user
    myDataBase.findOneAndUpdate(
      { githubId: profile.id },
      {
        $setOnInsert: {
          githubId: profile.id,
          username: profile.username,
          name: profile.displayName || 'John Doe',
          photo: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          email: Array.isArray(profile.emails) && profile.emails[0] ? profile.emails[0].value : 'No public email',
          created_on: new Date(),
          provider: profile.provider || 'github'
        },
        $set: {
          last_login: new Date()
        },
        $inc: {
          login_count: 1
        }
      },
      {
        upsert: true,
        new: true,
        returnOriginal: false
      },
      (err, doc) => {
        if (err) {
          console.error('Database error:', err);
          return cb(err);
        }
        return cb(null, doc.value);
      }
    );
  }
  ));
};