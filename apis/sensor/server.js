import dotenv from 'dotenv'
dotenv.config({
  path: './.env',
  debug: true
})

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});