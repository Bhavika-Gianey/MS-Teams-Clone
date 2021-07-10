const express = require('express');
const path = require("path");
const app = express();
const server = require('http').Server(app); //establishing server
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const {
  v4: uuidV4
} = require('uuid'); //generates unique id for each room
const passport = require('passport');
const session = require('express-session');
const users = require('./models/models.js');
const flash = require('connect-flash');

//Importing peerjs(webrtc framework for peer to peer connection)
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


//defining session secrets
app.use(session({
  secret: 'secret',
  maxAge: 3600000,
  resave: false,
  saveUninitialize: false
}))

//initialize passport
app.use(passport.initialize()) //initialiazing passportjs
app.use(passport.session()) //initializing passport sessions

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

//checking user authentication
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
    next();
  } else {
    req.flash('error_messages', "Please Login to continue !");
    res.redirect('/home');
  }
}


//index route
app.get('/', checkAuth, (req, res) => {
  res.render('index.ejs', {
    user: req.user
  });
})

//home route before user authentication
app.get('/home', (req, res) => {
  res.render('home.ejs', {
    user: req.user
  });
})

//redirecting to room route after succesful authentication
app.get('/room', checkAuth, (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.post('/userroom',(req, res) => {
  hostId = req.body.txt;
  res.redirect(`/${hostId}`)
})

//login page web route
app.get('/login', (req, res) => {
  res.render('login.ejs');
})

//logout page web route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/home');
})


//register page web route
app.get('/register', (req, res) => {
  res.render('register.ejs');
})

// unique route generated using uuid
app.get('/:room', checkAuth, (req, res) => {
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
    //encrypting password using hash function before storing in database
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


//user registration authentication
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
        //encryption of password
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

var connectedPeers = {};

//getting users
function getUserarray(arr) {
  onlineUsers = [];
  arr.forEach((onlineUser) => {
    onlineUsers.push(Object.values(onlineUser)[0]);
  });
  return onlineUsers;
}

//extablishing socket connection
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, userName) => {
    var connectedUser = {};
    console.log(roomId, userId);
    console.log(userId + ' User connected ');
    //joining the room
    socket.join(roomId);

    connectedUser[socket.id] = userName; //mapping userName with userId
    if(connectedPeers[roomId]) connectedPeers[roomId].push(connectedUser);
    else connectedPeers[roomId] = [connectedUser];

    //broadcasting new peer connection to every room
    socket.broadcast.to(roomId).emit('user-connected', userId,userName);




    // messages
    socket.on('message', (message, user) => {
      //send message to the same room
      io.to(roomId).emit('createMessage',message,user);
    });


    //Seninding all connected peers array
    io.to(roomId).emit("connected-users", getUserarray(connectedPeers[roomId]));

    //removing disconnected user from other peers streams
    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
      connectedPeers[roomId].forEach((user,index) => {
        if (user[socket.id]) {
          connectedPeers[roomId].splice(index, 1);
        }
        //Send online users array
        io.to(roomId).emit("connected-users", getUserarray(connectedPeers[roomId]));
      })
    })
  });
});

//port
server.listen(process.env.PORT || 3000, () => {
  console.log("app now listening for requests on port 3000");
});
