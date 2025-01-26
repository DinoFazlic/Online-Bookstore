const pool = require('../config/db'); // Ensure this points to your database connection file
const bcrypt = require('bcrypt');


const User = {
    // Create a new user
    create: async (username, email, password) => {
        //console.log('Role Received in Model:', role); // Log the role received by the model

        const query = `
                        INSERT INTO users (username, email, password)
                        VALUES ($1, $2, $3) RETURNING *;
                    `;
        const values = [username, email, password];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Find a user by email
    findByEmail: async (email) => {
        const query = `SELECT * FROM users WHERE email = $1;`;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    },



};

module.exports = User;
