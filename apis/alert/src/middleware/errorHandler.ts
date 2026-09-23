import type { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Error:', err.message);
  console.error('Error:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.name + ': ' + err.message || 'Internal Server Error';

  res.status(statusCode).json({ error: message });
};

export default errorHandler;