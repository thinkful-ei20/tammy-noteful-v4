'use strict';

const express = require('express');
const router = express.Router();

const passport = require('passport');

const options = {session: false, failWithError: true};
const localAuth = passport.authenticate('local', options);

router.post('/', localAuth, function(req, res) {
  return res.json(`${req.user.username} logged in`);
});

module.exports = router;