import test from 'ava';
import {MongoDBServer} from 'mongomem';
import mongoose from 'mongoose';

const agent = require('supertest-koa-agent');
const createApp = require('../src/app');

const app = agent(createApp());

test.before('start server', async () => {
  await MongoDBServer.start();
});

test.before(async () => {
  const uri = await MongoDBServer.getConnectionString();
  await mongoose.connect(uri);
  await app.post('/signup').send({
    '_id' : '1',
    'username' : 'newUser',
    'password' : 'signup',
    'userId': 1,
    'likes' : []
  });
  await app.post('/signup').send({
    '_id' : '2',
    'username' : 'newUser2',
    'password' : 'signup',
    'userId': 2,
    'likes' : []
  });
});

test('Can see list of most liked users', async t => {
  const res = await app.get('/most-liked ');
  t.is(res.status, 200);
  t.truthy(Array.isArray(res.body));
});

test('Get user\'s data', async t => {
  const res = await app.get('/user/1');
  t.is(res.status, 200);
  t.truthy(typeof res.body.username === 'string');
  t.truthy(Array.isArray(res.body.likes));
});

test('User with no likes has empty array', async t => {
  const res = await app.get('/user/2');
  t.is(res.status, 200);
  t.is(res.body.likes.length, 0);
});

test('Uses can send like', async t => {
  const userResponse = await app.post('/login').send({
    username: 'newUser',
    password: 'signup',
  });
  let res = await app.get('/user/2');
  const startingLikes = res.body.likes.length;
  const postRes = await app.post('/user/2/like').set('Authorization', `Bearer ${userResponse.body.token}`);
  t.is(postRes.status, 200);
  res = await app.get('/user/2');
  t.is(res.body.likes.length, startingLikes + 1);
});

test('Uses can remove like', async t => {
  const userResponse = await app.post('/login').send({
    username: 'newUser2',
    password: 'signup',
  });
  // user should have at least one like
  const setLikeRes = await app.post('/user/1/like').set('Authorization', `Bearer ${userResponse.body.token}`);
  t.is(setLikeRes.status, 200);
  const res = await app.get('/user/1');
  const postRes = await app.post('/user/1/unlike').set('Authorization', `Bearer ${userResponse.body.token}`);
  t.is(postRes.status, 200);
  t.is(postRes.body.success, true);
  const resultRes = await app.get('/user/1');
  t.is(resultRes.body.likes.length, res.body.likes.length - 1);
});


test('Get user by invalid id should be 404', async t => {
  const res = await app.get('/user/666');
  t.is(res.status, 404);
});

test.after.always('cleanup', () => {
  MongoDBServer.tearDown();
});
