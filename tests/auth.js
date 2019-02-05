import test from 'ava';
import {MongoDBServer} from 'mongomem';
import mongoose from 'mongoose';
import User from '../src/modules/users/user';

const { generateHash } = require('../src/services/auth');

const agent = require('supertest-koa-agent');
const createApp = require('../src/app');

const app = agent(createApp());

test.before('start server', async () => {
  await MongoDBServer.start();
});

test.before(async () => {
  const uri = await MongoDBServer.getConnectionString();
  await mongoose.connect(uri);
});


test('New user can signup', async t => {
  const res = await app.post('/signup').send({
    'username' : 'newUser',
    'password' : 'signup',
  });
  t.is(res.status, 200);
  t.truthy(typeof res.body.token === 'string');
  t.truthy(typeof res.body.refreshToken === 'string');
});

test('New user should have unique username', async t => {
  const user = new User({
    username: 'defaultuser@sdffd.com',
    password: '123456',
    userId: '10'
  });
  await user.save();
  const res = await app.post('/signup').send({
    'username' : 'defaultuser@sdffd.com',
    'password' : '123456',
  });
  t.is(res.status, 400);
});

test('New user should provide username', async t => {
  const res = await app.post('/signup').send({
    'username' : '',
    'password' : 'signup',
  });
  t.is(res.status, 400);
});

test('User can successfully login', async t => {

  const user = new User({
    username: 'defaultuser@sdffd11.com',
    password: await generateHash('password'),
    userId: '10'
  });
  await user.save();
  const res = await app.post('/login').send({
    username: 'defaultuser@sdffd11.com',
    password: 'password',
  });

  t.is(res.status, 200);
  t.truthy(typeof res.body.token === 'string');
  t.truthy(typeof res.body.refreshToken === 'string');
});

test('User gets 403 on invalid credentials', async t => {
  const res = await app.post('/login').send({
    username: 'INVALID',
    password: 'INVALID',
  });
  t.is(res.status, 403);
});

test.todo('User receives 401 on expired token');
test.todo('User can get new access token using refresh token');
test.todo('User get 404 on invalid refresh token');

test.after.always('cleanup', () => {
  MongoDBServer.tearDown();
});

