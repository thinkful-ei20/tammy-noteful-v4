'use strict';

const express = require('express');
const router = express.Router();

//const mongoose = require('mongoose');

const User = require('../models/user');

router.post('/', (req, res, next) => {
  const { fullname, username, password } = req.body;

  const newItem = {
    fullname,
    username,
    password
  };
  
  console.log(newItem);

  User.create(newItem)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));

});

module.exports = router;