const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    email: {
      type: String,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    messages: [{
      type: String,
    }]
});
module.exports = new mongoose.model('users',userschema)
