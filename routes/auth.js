'use strict';

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');


const router = express.Router();
const {JWT_SECRET, JWT_EXPIRY} = require('../config');


const options = {session: false, failWithError: true};
const localAuth = passport.authenticate('local', options);

function createAuthToken(user){
  return jwt.sign({user}, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}

router.post('/login', localAuth, (req, res) => {
  // const {username, password} = req.body;

  // const requiredFields = ['username', 'password'];
  // const missingField = requiredFields.find(field => !(field in req.body));
  
  // if(missingField) {
  //   return res.status(422).json({
  //     code: 422,
  //     reason: 'Validation Error',
  //     message: 'Missing Field',
  //     location: missingField
  //   });
  // }


  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

module.exports = router;

