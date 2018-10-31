const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.Promise = global.Promise;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  'mongodb://localhost:27017/login',
  { useNewUrlParser: true },
  () => {
    console.log('CONNECTED');
  },
);

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  const newUser = new User({
    email,
    password,
  });
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        newUser.password = hash;
        newUser
          .save()
          .then((savedUser) => {
            res.status(200).send(`User Created: ${savedUser}`);
          })
          .catch((_err) => {
            res.status(500).send(`Error Creating User: ${_err}`);
          });
      }
    });
  });
});

app.post('/login', (req, res) => {
  let { email, password } = req.body;
  User.findOne({ email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, matched) => {
        if (matched) {
          res.status(200).send('USER WAS ABLE TO LOG IN');
        } else {
          res.status(404).send('USER CANNOT LOG IN');
        }
      });
    }
  });
});

app.listen(4111, () => {
  console.log('Listening on port 4111');
});
