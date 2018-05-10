'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');
const seedUsers = require('../db/seed/users');

const expect = chai.expect;

chai.use(chaiHttp);

describe.only('Noteful API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.insertMany(seedUsers)
      .then(() => User.createIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });
  
  describe('/api/users', function () {
    describe('POST', function () {
      it('Should create a new user', function () {
        const testUser = { username, password, fullname };

        let res;
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'fullname');

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.fullname).to.equal(testUser.fullname);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.fullname).to.equal(testUser.fullname);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it('Should reject users with missing username', function () {
        const testUser = { password, fullname };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            console.log(typeof res.body.reason);
            expect(res.body.reason).to.equal('Validation Error');
            console.log(typeof res.body.message);
            expect(res.body.message).to.equal('Missing Field');
            expect(res.body.location).to.equal('username');
          });
      });
  

      /**
       * COMPLETE ALL THE FOLLOWING TESTS
       */
      it('Should reject users with missing password', function() {
        const testUser = {username, fullname};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('Validation Error');
            expect(res.body.message).to.equal('Missing Field');
            expect(res.body.location).to.equal('password');
          });
      });


      it('Should reject users with non-string username', function () {
        const testUser = {username: 123456123, password, fullname};
        return chai.request(app).post('/api/users').send(testUser)
          .then (res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('Validation Error');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            console.log(res.body.location);
            expect(res.body.location).to.equal('username');
          });
      });


      it('Should reject users with non-string password', function () {
        const testUser = {username, password : 1234512, fullname};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res =>{
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('Validation Error');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('password');
          });
      });
    
      it('Should reject users with non-trimmed username', function () {
        const testUser = {username: 'useruser  ' , password, fullname};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('Validation Error');
            expect(res.body.message).to.equal('Cannot start or end with a space');
            expect(res.body.location).to.equal('username');
          });
      });

      it('Should reject users with non-trimmed password', function () {
        const testUser = {username, password: 'password  ', fullname};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('Validation Error');
            expect(res.body.message).to.equal('Cannot start or end with a space');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with empty username', function() {
        const testUser = {username: '', password, fullname};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('Validation Error');
          });
      });
        

      it('Should reject users with password less than 8 characters', function () {
        const testUser = {username, password: 'less', fullname};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('Validation Error');
            expect(res.body.message).to.equal('Must be at least 8 characters long.');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with password greater than 72 characters', function () {
        const testUser = {username, password: '1234567890123456789012345678901234567890123456789012345678901234567890123', fullname};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('Validation Error');
            expect(res.body.message).to.equal('At most can be 35 characters long');
            expect(res.body.location).to.equal('password');
          });

      });

      it('Should reject users with duplicate username', function () {
        const testUser = {username:'user0', password, fullname};
        return chai.request(app).post('/api/users').send(testUser)
          .then (res => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('The username already exists');
          });
      });

    });

   
    // describe('GET', function () {
    //   it('Should return an array of three initially', function () {
    //     return chai.request(app).get('/api/users')
    //       .then(res => {
    //         console.log(res.body);
    //         expect(res).to.have.status(200);
    //         expect(res.body).to.be.an('array');
    //         expect(res.body).to.have.length(3);
    //       });
    //   });
    //   it('Should return an array of users', function () {
    //     const testUser0 = {
    //       username: `${username}`,
    //       password: `${password}`,
    //       fullname: ` ${fullname} `
    //     };
    //     const testUser1 = {
    //       username: `${username}1`,
    //       password: `${password}1`,
    //       fullname: `${fullname}1`
    //     };
    //     const testUser2 = {
    //       username: `${username}2`,
    //       password: `${password}2`,
    //       fullname: `${fullname}2`
    //     };

    /**
         * CREATE THE REQUEST AND MAKE ASSERTIONS
         */
    //   });
    // });

  });
});