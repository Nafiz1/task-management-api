const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { Queue } = require('bullmq');

// Initialize BullMQ queue
let taskQueue;

try {
  taskQueue = new Queue('taskQueue', {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  });
  console.log('Connected to Redis for BullMQ');
} catch (error) {
  console.error('Failed to connect to Redis:', error);
}

const router = express.Router();

// Protect all task routes
router.use(auth);

// Create a new task
router.post('/', async (req, res) => {
  try {
    console.log('User ID from Token:', req.userId); // Log the user ID
    const task = new Task({ ...req.body, user: req.userId });
    await task.save();

    if (taskQueue) {
      await taskQueue.add('updateTaskStatus', {
        taskId: task._id,
        status: 'In Progress',
      });
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error); // Log the error
    res.status(400).json({ message: error.message });
  }
});

// Get all tasks for the authenticated user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }); // Filter by user
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error); // Log the error
    res.status(500).json({ message: error.message });
  }
});

// Get a single task by ID (owned by the authenticated user)
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error); // Log the error
    res.status(500).json({ message: error.message });
  }
});

// Update a task by ID (owned by the authenticated user)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    Object.assign(task, req.body); // Update task fields
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error); // Log the error
    res.status(400).json({ message: error.message });
  }
});

// Delete a task by ID (owned by the authenticated user)
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error); // Log the error
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;