'use strict';

const express = require('express');
const router = express.router();

const mongoose = require('mongoose');

const User = require('../models/user');

router.post('api/user', (res, req, next) => {
  const {firstname, username, password} = req.body;
  
  const newItem = {
    firstname,
    username,
    password
  };
  User.create(newItem)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).stauts(201).json(result);
    })
    .catch(err => next(err));

});