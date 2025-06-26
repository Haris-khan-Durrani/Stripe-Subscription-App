const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'stripe_app',
  password: 'stripe_app',
  database: 'stripe_app',
});

module.exports = pool;
