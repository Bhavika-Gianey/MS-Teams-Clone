// if (process.env.NODE_ENV != 'production') {
//   require('dotenv').config()
// }
require("dotenv").config();

const express = require('express');
const path = require("path");
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const {
  v4: uuidV4
} = require('uuid');
const passport = require('passport');
const session = require('express-session');
const users = require('./models.js');
const flash = require('connect-flash');

// if (app.get("env") === "production") {
//   // Serve secure cookies, requires HTTPS
//   session.cookie.secure = true;
// }
// const initializePassport = require('./passport-config')
// initializePassport(passport,email => {
//   return users.find(user => user.email === email)
// })

//Import peerjs
const {
  ExpressPeerServer
} = require('peer');

const peerServer = ExpressPeerServer(server, {
  debug: true
});



// assests
app.use(express.static("public"));
app.use('/peerjs', peerServer);
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  /*cookie: {},*/
  maxAge: 3600000,
  resave: false,
  saveUninitialize: false
}))
app.use(passport.initialize())
app.use(passport.session())

//connect Flash
app.use(flash());
//setting global variables
app.use((req, res, next) => {
  res.locals.success_message = req.flash('success_message');
  res.locals.error_message = req.flash('error_message');
  res.locals.error = req.flash('error');
  next();
})


// set template engine
app.set("views", path.join(__dirname, "/src/views"));
app.set("view engine", "ejs");


//connecting to the database
mongoose.connect('mongodb+srv://bhavika:sumit@users.izn10.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
});

var db = mongoose.connection;


//if found err in connecting database
db.on('error', () => console.log("error while connecting"));
db.once('open', () => console.log("connected to database"))

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.redirect('/home');
    }
}





app.get('/',checkAuth, (req, res) => {
  res.render('index.ejs', {
    user: req.user
  });
})
app.get('/home',(req,res)=>{
  res.render('home.ejs',{
    user: req.user
  });
})

app.get('/room',checkAuth, (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/login', (req, res) => {
  res.render('login.ejs');
})

app.get('/logout',(req,res)=>{
  req.logout();
  res.redirect('/home');
})

app.get('/register', (req, res) => {
  res.render('register.ejs');
})

app.get('/:room',checkAuth, (req, res) => {
  if (req.user) {
    res.render('room.ejs', {
      roomId: req.params.room,
      user: req.user.name,
    })
  } else {
    res.render('login.ejs')
  }
})




//Authentication Strategy
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({
  usernameField: 'email'
}, (email, password, done) => {
  users.findOne({
    email: email
  }, (err, data) => {
    if (err) return done(err);
    if (!data) {
      return done(null, false, {
        message: "User does not exist"
      });
    }
    bcrypt.compare(password, data.password, (err, match) => {
      if (err) return done(null, false);
      if (!match) return done(null, false, {
        message: "Password does not match"
      });
      if (match) {
        return done(null, data);
      }
    })
  })
}))

//serializing data and using user data in SESSION
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
})

//retrieving user data from serialize SESSION
passport.deserializeUser(function(id, cb) {
  users.findById(id, function(err, user) {
    cb(err, user);
  })
})

// end of authentication Strategy
app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/',
    failureFlash: true,
  })(req, res, next);
})


app.post('/register', (req, res) => {
  var {
    name,
    email,
    password
  } = req.body;
  var err;
  if (typeof err == 'undefined') {
    users.findOne({
      email: email
    }, function(err, data) {
      if (err) throw err;
      if (data) {
        console.log("User Exists");
        err = "User already exists with this email...";
        res.render('register', {
          'err': err,
          'email': email,
          'name': name
        });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err;
            password = hash;
            users({
              name,
              email,
              password,
            }).save((err, data) => {
              if (err) throw err;
              req.flash('success_message', "Registered successfully");
              res.redirect('/login');
            })
          });
        });
      }
    });
  }
})


io.on('connection', socket => {
      socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId);
        console.log(userId + ' User connected ');
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        // messages
        socket.on('message', (message,user) => {
          //send message to the same room
          io.to(roomId).emit('createMessage', message,user)

          socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
          })
        })
      });
    });

      server.listen(process.env.PORT || 3000, () => {
        console.log("app now listening for requests on port 3000");
      });
