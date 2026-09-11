import dotenv from 'dotenv';
dotenv.config({
  path: './.env',
  debug: true
});

import app from './src/app.js';

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});