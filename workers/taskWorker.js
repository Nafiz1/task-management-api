const { Worker } = require('bullmq');
const Task = require('../models/Task');

const worker = new Worker('taskQueue', async (job) => {
  const { taskId, status } = job.data;

  // Simulate a long-running task
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Update task status
  await Task.findByIdAndUpdate(taskId, { status });
  console.log(`Task ${taskId} status updated to ${status}`);
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});