module.exports = function (app, myDataBase) {
  const passport = require('passport');
  const bcrypt = require('bcrypt');
  const { ObjectID } = require('mongodb');

  // Función middleware para verificar autenticación
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }

  // Configuración de Pug
  app.set('view engine', 'pug');
  app.set('views', './views/pug');

  // Ruta principal
  app.route('/').get((req, res) => {
    res.render('index', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    });
  });

  // Ruta GET para mostrar el formulario de registro
  app.get('/register', (req, res) => {
    res.render('index', {
      title: 'Register',
      message: 'Register a new account',
      showLogin: false,
      showRegistration: true
    });
  });

  // Ruta de registro POST
  app.post('/register', (req, res, next) => {
    myDataBase.findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect('/');
      } else {
        // Hash the password before saving
        const hash = bcrypt.hashSync(req.body.password, 12);
        myDataBase.insertOne({
          username: req.body.username,
          password: hash
        },
          (err, doc) => {
            if (err) {
              res.redirect('/');
            } else {
              // The inserted document is held within
              // the ops property of the doc
              next(null, doc.ops[0]);
            }
          }
        )
      }
    })
  });

  // Ruta de registro con autenticación
  app.post('/register',
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/profile');
    }
  );

  // Ruta de login POST
  app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile');
  });

  // Rutas de autenticación con GitHub
  app.get('/auth/github', passport.authenticate('github'));

  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
      req.session.user_id = req.user.id;
      res.redirect('/chat');
    }
  );

  // Ruta del perfil con protección de autenticación
  app.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', {
      username: req.user.username
    });
  });

  // Ruta del chat con protección de autenticación
  app.get('/chat', ensureAuthenticated, (req, res) => {
    res.render('chat', {
      user: req.user
    });
  });

  // Ruta de logout
  app.route('/logout')
    .get((req, res) => {
      req.logout();
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).send('Error destroying session');
        }
        res.redirect('/');
      });
    });

  // Rutas para pruebas de freeCodeCamp
  app.get('/api/package.json', (req, res) => {
    res.json(require('./package.json'));
  });

  app.get('/api/server.js', (req, res) => {
    res.type('application/javascript').send(require('fs').readFileSync('./server.js', 'utf8'));
  });

  // Middleware para manejar páginas no encontradas (404)
  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
};