'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const {TEST_MONGODB_URI, JWT_SECRET} = require('../config');

const User = require('../models/user');
const expect = chai.expect;
chai.use(chaiHttp);

describe.only('Noteful API - Login', function () {
  const fullname = 'Example User';
  const username = 'exampleUser';
  const password = 'password';

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return User.hashPassword(password)
      .then(digest => User.create({fullname, username, password: digest}));
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  it('Should return a valid auth token', function () {
    return chai.request(app)
      .post('/api/login')
      .send({username, password})
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.authToken).to.be.a('string');

        const payload = jwt.verify(res.body.authToken, JWT_SECRET);

        expect(payload.user).to.not.have.property('password');
        expect(payload.user.username).to.equal(username);
        expect(payload.user.fullname).to.equal(fullname);
      });
  });

  it('Should reject requests with no credentials', function () {
    return chai.request(app)
      .post('/api/login')
      .send({username: '', password: ''})
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('Bad Request');

      });
  });


  it('Should reject requests with incorrect usernames', function () {
    const loginUser = {username: 'iDontExist', password};
    return chai.request(app)
      .post('/api/login')
      .send(loginUser)
      .then(res => {
        expect(res).to.have.status(401);
        expect(res.body.message).to.equal('Unauthorized');
      });

  }); 

  it('Should reject requests with incorrect passwords', function () {
    const loginUser = {username, password:'iAmWrong'};
    return chai.request(app)
      .post('/api/login')
      .send(loginUser)
      .then (res => {
        expect(res).to.have.status(401);
        expect(res.body.message).to.equal('Unauthorized');
      });
  });

  describe('/api/refresh', function () {
    it('should return a valid auth token with a newer expiry date', function () {
      console.log(username);
      const user = { username, fullname };
      const token = jwt.sign({ user }, JWT_SECRET, { subject: username, expiresIn: '1m' });
      const decoded = jwt.decode(token);
  
      return chai.request(app)
        .post('/api/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          console.log(res);
          console.log(res.status);
          expect(res).to.have.status(200);
          expect(res.body).to.been.a('object');
          const authToken = res.body.authToken;
          expect(authToken).to.be.a('string');
  
          const payload = jwt.verify(authToken, JWT_SECRET);
          expect(payload.user).to.deep.equal({ username, fullname });
          expect(payload.exp).to.be.greaterThan(decoded.exp);
        });
    });  
  });
  
});

