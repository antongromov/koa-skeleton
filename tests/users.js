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
    'username' : 'newuser',
    'password' : 'signup',
    'userId': 1,
    'likes' : []
  });
  await app.post('/signup').send({
    '_id' : '1',
    'username' : 'newuser2',
    'password' : 'signup',
    'userId': 1,
    'likes' : []
  });
});

test('Users receive\'s own data', async t => {
  const tokenRes = await app.post('/login').send({
    username: 'newuser',
    password: 'signup',
  });
  const res = await app.get('/me').set('Authorization', `Bearer ${tokenRes.body.token}`);
  t.is(res.status, 200);
  t.is(res.body.username, 'newuser');
});

test('Users can reset password', async t => {
  const tokenRes = await app.post('/login').send({
    username: 'newuser',
    password: 'signup',
  });
  const postRes = await app.post('/me/update-password').set('Authorization', `Bearer ${tokenRes.body.token}`).send({
    'password': 'newpasswoerd',
  });
  t.is(postRes.status, 200);
  const newPassRes = await app.post('/login').send({
    username: 'newuser',
    password: 'newpasswoerd',
  });
  t.is(newPassRes.status, 200);
});

test('Users cant set invalid', async t => {
  const tokenRes = await app.post('/login').send({
    username: 'newuser2',
    password: 'signup',
  });
  t.is(tokenRes.status, 200);
  const postRes = await app.post('/me/update-password').set('Authorization', `Bearer ${tokenRes.body.token}`).send({
    'password': '11',
  });
  t.is(postRes.status, 400);
});

test.after.always('cleanup', () => {
  MongoDBServer.tearDown();
});
