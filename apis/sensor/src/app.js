const express = require('express');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.get('/', (req, res) => {
  res.send('hello world');
});
// Routes
app.use('/api', apiRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;