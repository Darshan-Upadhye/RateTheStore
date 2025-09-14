const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // your Render DB URL
  ssl: { rejectUnauthorized: false }          // required for Render
});

module.exports = pool;
