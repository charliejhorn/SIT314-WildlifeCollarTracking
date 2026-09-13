import express from 'express';
import logger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

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

export default app;