'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const passportSocketIo = require('passport.socketio');
const http = require('http');
const io = require('socket.io');

const app = express();

// Configuración CORS simple y permisiva para desarrollo y pruebas
app.use(cors({
  origin: true, // Permitir todas las origins durante desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control']
}));

// Headers CORS adicionales para solicitudes OPTIONS
app.use((req, res, next) => {
  const origin = req.get('origin');

  // Configuración permisiva para desarrollo
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control');

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

// Configuración de sesión con MongoStore
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });

app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  key: 'express.sid',
  store: store
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Iniciar servidor con conexión a base de datos
myDB(async (client) => {
  const myDataBase = await client.db('database').collection('users');

  // Initialize authentication and routes modules
  require('./auth.js')(app, myDataBase);
  require('./routes.js')(app, myDataBase);

  // Create HTTP server and Socket.IO
  const httpServer = http.createServer(app);
  const io = require('socket.io')(httpServer);

  // Socket.IO authorization with Passport
  io.use(
    passportSocketIo.authorize({
      cookieParser: cookieParser,
      key: 'express.sid',
      secret: process.env.SESSION_SECRET,
      store: store,
      success: onAuthorizeSuccess,
      fail: onAuthorizeFail
    })
  );

  // Socket.IO authorization callbacks
  function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
    accept(null, true);
  }

  function onAuthorizeFail(data, message, error, accept) {
    if (error) throw new Error(message);
    console.log('failed connection to socket.io:', message);
    accept(null, false);
  }

  // Socket.IO connection handling
  let currentUsers = 0;

  io.on('connection', socket => {
    console.log('user ' + socket.request.user.username + ' connected');
    ++currentUsers;
    io.emit('user', {
      username: socket.request.user.username,
      currentUsers,
      connected: true
    });

    // Handle chat messages
    socket.on('chat message', (message) => {
      io.emit('chat message', {
        username: socket.request.user.username,
        message: message
      });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log('user ' + socket.request.user.username + ' disconnected');
      --currentUsers;
      io.emit('user', {
        username: socket.request.user.username,
        currentUsers,
        connected: false
      });
    });
  });
  
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log('✅ Server running on port', PORT);
    console.log('✅ Connected to MongoDB Atlas');
    console.log('✅ Passport serialization configured');
    console.log('✅ Socket.IO server initialized');
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
  httpServer.listen(PORT, () => {
    console.log('⚠️ Server running on port', PORT, '(Database unavailable)');
  });
});
