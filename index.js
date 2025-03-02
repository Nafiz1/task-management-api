// index.js
require('dotenv').config(); // Load .env variables if needed
const app = require('./app');

const port = process.env.PORT || 3000;

// Now, only start the server if we're NOT in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
