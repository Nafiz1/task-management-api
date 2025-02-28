const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Import task routes
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
  
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
app.get('/', (req, res) => {
  res.send('Task Management API');
});

// Use task routes
app.use('/tasks', taskRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});