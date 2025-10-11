'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const { ObjectID } = require('mongodb');
const LocalStrategy = require('passport-local');

const app = express();

// Configuración CORS ultra permisiva para pruebas de freeCodeCamp
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}));

// Headers CORS adicionales
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

fccTesting(app);

app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Iniciar servidor con conexión a base de datos
myDB(async (client) => {
  const myDataBase = await client.db('database').collection('users');

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
      if (password !== user.password) return done(null, false);
      return done(null, user);
    });
  }));

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
      showRegistration: true
    });
  });

  // Ruta de registro POST
  app.route('/register')
    .post((req, res, next) => {
      myDataBase.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect('/');
        } else {
          myDataBase.insertOne({
            username: req.body.username,
            password: req.body.password
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
    },
      passport.authenticate('local', { failureRedirect: '/' }),
      (req, res, next) => {
        res.redirect('/profile');
      }
    );
  
  // Ruta de login POST
  app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile');
  });
  
  // Ruta del perfil con protección de autenticación
  app.get('/profile', ensureAuthenticated, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.render('profile', {
      username: req.user.username
    });
  });
  
  // Ruta de logout
  app.route('/logout')
    .get((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      req.logout((err) => {
        if (err) {
          console.error('Logout error:', err);
        }
        res.redirect('/');
      });
    });
  
  // Rutas para pruebas de freeCodeCamp
  app.get('/api/package.json', (req, res) => {
    res.json(require('./package.json'));
  });
  
  app.get('/api/server.js', (req, res) => {
    res.type('application/javascript').send(require('fs').readFileSync(__filename, 'utf8'));
  });

  // Middleware para manejar páginas no encontradas (404)
  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('✅ Server running on port', PORT);
    console.log('✅ Connected to MongoDB Atlas');
    console.log('✅ Passport serialization configured');
  });

}).catch(e => {
  console.error('❌ Database connection failed:', e.message);

  // Configuración de Pug como fallback si la base de datos no se conecta
  app.set('view engine', 'pug');
  app.set('views', './views/pug');

  // Ruta principal con error
  app.route('/').get((req, res) => {
    res.render('index', {
      title: 'Database Connection Failed',
      message: 'Please check your MongoDB connection'
    });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('⚠️ Server running on port', PORT, '(Database unavailable)');
  });
});
