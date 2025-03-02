require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const mongoose = require('mongoose');
const { Queue } = require('bullmq');
const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');

describe('Task Routes', () => {
  let token = '';
  let createdTaskId = '';
  let taskQueue;

  beforeAll(async () => {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // Initialize BullMQ queue
    taskQueue = new Queue('taskQueue', {
      connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    });
  });

  beforeEach(async () => {
    // Clear users and tasks before each test
    await User.deleteMany({});
    await Task.deleteMany({});

    // Clear the Redis queue
    await taskQueue.obliterate({ force: true });

    // Register & login a user to get a fresh token
    await request(app)
      .post('/auth/register')
      .send({ username: 'tasktester', password: 'taskpassword' });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'tasktester', password: 'taskpassword' });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Close MongoDB connection
    await mongoose.connection.close();

    // Close BullMQ queue
    await taskQueue.close();
  });

  it('should create a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', description: 'Some description' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Test Task');

    createdTaskId = res.body._id; // save for later tests if desired
  });

  it('should get all tasks', async () => {
    // Create 2 tasks
    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task 1', description: 'Desc 1' });

    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task 2', description: 'Desc 2' });

    // GET /tasks
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    // Should be an array of tasks
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('title');
  });

  it('should get a single task by ID', async () => {
    // First create a task
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Single Task', description: 'One' });

    const { _id: taskId } = createRes.body;

    // GET /tasks/:id
    const res = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Single Task');
  });

  it('should update a task by ID', async () => {
    // Create a task
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Update Me', description: 'Before update' });

    const { _id: taskId } = createRes.body;

    // PUT /tasks/:id
    const updateRes = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Task Title' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe('Updated Task Title');
  });

  it('should delete a task by ID', async () => {
    // Create a task
    const createRes = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Delete Me', description: 'I will be removed' });

    const { _id: taskId } = createRes.body;

    // DELETE /tasks/:id
    const deleteRes = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toHaveProperty('message', 'Task deleted successfully');
  });
});