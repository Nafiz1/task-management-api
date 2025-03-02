// test/auth.test.js

require('dotenv').config({ path: '.env.test' });  // Loads test DB credentials
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');  // The Express app
const User = require('../models/User');  // So we can clear the user collection

describe('Auth Routes', () => {
  beforeAll(async () => {
    // If app.js doesn't automatically connect, you can do:
    // await mongoose.connect(process.env.MONGO_URI);
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  // Clear the users collection before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Close DB connection so Jest can exit cleanly
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should login and return a token', async () => {
    // First, register the user
    await request(app)
      .post('/auth/register')
      .send({ username: 'testuser', password: 'testpassword' })
      .expect(201);

    // Then, login
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
  });
});
