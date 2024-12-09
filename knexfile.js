require('dotenv').config(); // Load environment variables

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'realtimeSign',
    },
    migrations: {
      directory: './migrations', // Optional: Path for migrations
    },
    seeds: {
      directory: './seeds', // Optional: Path for seeds
    },
  },
};
