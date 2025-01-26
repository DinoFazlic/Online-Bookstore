const { Pool } = require('pg'); // PostgreSQL konfiguracija
const pool = require('../config/db');

const Category = {
    getAll: async () => {
        const query = 'SELECT * FROM categories';
        try {
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Database error while fetching categories:', error);
            throw error;
        }
    },
    getCategoriesForBook: async (bookId) => {
        const query = `
            SELECT categories.id, categories.name
            FROM categories
            JOIN category_book ON categories.id = category_book.category_id
            WHERE category_book.book_id = $1
        `;
        try {
            const { rows } = await pool.query(query, [bookId]);
            return rows[0];
        } catch (error) {
            console.error('Database error while fetching categories for book:', error);
            throw error;
        }
    },

};

module.exports = Category;
