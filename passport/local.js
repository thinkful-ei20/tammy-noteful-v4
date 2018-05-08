'use strict';

const {Strategy: LocalStrategy} = require('passport-local');

const User = require('../models/user');

const localStrategy = new LocalStrategy((username, password, done) =>{
  let user;
  User.findOne({username})
    .then(result => {
      user = result;
      if(!user){
        return Promise.reject({
          reason: 'Login error',
          message: 'Incorrect username',
          location:'username'
        });
      } 
    
      return  user.validatePassword(password);

    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'Login error',
          message: 'Incorrect password',
          location: 'password'
        });
      }
      return done (null, user);
    })
    .catch(err => {
      if (err.reason === 'Login error'){
        return done (null, false);
      }
      return done(err);
    });
});

module.exports = localStrategy;