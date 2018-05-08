'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

//const mongoose = require('mongoose');

const User = require('../models/user');

router.post('/', (req, res, next) => {
  const { fullname, username, password } = req.body;

  //validate for all fields
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  
  if(missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'Validation Error',
      message: 'Missing Field',
      location: missingField
    });
  }

  //validate that input is a STRING

  const stringFields = ['username', 'password', 'fullname'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string');

  if(nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'Validation Error',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  const trimmedFields = ['username', 'password'];
  const nonTrimmedField = trimmedFields.find(
    field => req.body[field].trim() !== req.body[field]);

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'Validation Error',
      message: 'Cannot start or end with a space',
      location: nonTrimmedField
    });
  }

  const sizeFields = {
    username: {min: 5 },
    password: {min: 8, max: 35}
  };

  const tooSmallField = Object.keys(sizeFields).find (
    field => 'min' in sizeFields[field] && req.body[field].trim().length < sizeFields[field].min
  );

  const tooLargeField = Object.keys(sizeFields).find(
    field => 'max' in sizeFields[field] && req.body[field].trim().length > sizeFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason:'Validation Error',
      message: tooSmallField ? `Must be at least ${sizeFields[tooSmallField].min} characters long.`
        : `At most can be ${sizeFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  User.hashPassword(password)
    .then(digest => {
      const newItem = {
        fullname,
        username,
        password: digest
      };
      return User.create(newItem);
    })
    .then(result => {
      return res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch (err => {
      if (err.code === 11000){
        err = new Error ('The username already exists');
        err.status = 400;
      }
      next(err);
    }); 
});

module.exports = router;