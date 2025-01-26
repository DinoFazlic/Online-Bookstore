const { Pool } = require('pg');
require('dotenv').config();

console.log('Loaded environment variables:');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '****' : 'Not Set');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    //password: 'BHGvKMllA46GiAjpl1UMhTygOayEbVsy',
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: {rejectUnauthorized: true},
});

pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
});

module.exports = pool; // Export the pool instance

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection test failed:', err);
    } else {
        console.log('Database connection successful:', res.rows[0]);
    }
});
