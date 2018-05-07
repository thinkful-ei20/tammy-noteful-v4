'use strict';

const express = require('express');
const router = express.Router();

//const mongoose = require('mongoose');

const User = require('../models/user');

router.post('/', (req, res, next) => {
  const { fullname, username, password } = req.body;

  User.hashPassword(password)
    .then(digest => {
      const newItem = {
        fullname,
        username: digest,
        password
      };
      return User.create(newItem);
    })
    .then(result => {
      return res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err.code === 11000){
      err = new Error ('The username already exists');
      err.status = 400;
    } 
    next(err);
});

module.exports = router;