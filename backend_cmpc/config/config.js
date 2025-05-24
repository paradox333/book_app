require('dotenv').config();

module.exports = {
  development: {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      schema: process.env.DB_SCHEMA,
      dialect: 'postgres'
  }
};
