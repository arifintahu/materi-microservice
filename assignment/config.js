const rc = require('rc');

const defaultConfig = {
  postgres: {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'database'
  },
  server: {
    port: 3000
  }
}

const config = rc('payment', defaultConfig);

module.exports = {
  config,
}