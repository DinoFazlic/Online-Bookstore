const pool = require('../config/db'); // Ensure this points to your database connection file
const bcrypt = require('bcrypt');

const User = {
    // Get user by ID
    getUserById: async (userId) => {
        try {
            const query = 'SELECT username, credits FROM users WHERE id = $1';
            const result = await pool.query(query, [userId]);

            // Return the user if found, otherwise null
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error; // Let the controller handle the error
        }
    },

    topUpCredits: async (userId, amount) => {
        const query = `
        UPDATE users
        SET credits = credits + $1
        WHERE id = $2
        RETURNING credits;
    `;
        const values = [amount, userId];

        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return result.rows[0].credits;
        }
        return null; // User not found
    },

    getAllExcludingPurchased: async (userId) => {
        const query = `
        SELECT * 
        FROM books 
        WHERE id NOT IN (
            SELECT book_id 
            FROM purchased_books 
            WHERE user_id = $1
        )
        ORDER BY created_at DESC
    `;
        try {
            const { rows } = await pool.query(query, [userId]);
            return rows;
        } catch (error) {
            console.error('Database error while fetching books:', error);
            throw error;
        }
    },
    getUserCredits: async (userId) => {
        const query = 'SELECT credits FROM users WHERE id = $1';
        try {
            const { rows } = await pool.query(query, [userId]);
            return rows[0].credits;
        } catch (error) {
            console.error('Database error while fetching user credits:', error);
            throw error;
        }
    },
    updateUserCredits: async (userId, updatedCredits) => {
        const query = 'UPDATE users SET credits = $1 WHERE id = $2';
        try {
            await pool.query(query, [updatedCredits, userId]);
        } catch (error) {
            console.error('Database error while updating user credits:', error);
            throw error;
        }
    },
    insertPurchasedBook: async (userId, bookId) => {
        const query = `
        INSERT INTO purchased_books (user_id, book_id)
        VALUES ($1, $2)
    `;
        try {
            await pool.query(query, [userId, bookId]);
        } catch (error) {
            console.error('Database error while inserting purchased book:', error);
            throw error;
        }
    },
    getByBookId: async (bookId) => {
        const query = `
        SELECT * 
        FROM reviews 
        WHERE book_id = $1
        ORDER BY created_at DESC
    `;
        try {
            const { rows } = await pool.query(query, [bookId]);
            return rows;
        } catch (error) {
            console.error('Database error while fetching reviews:', error);
            throw error;
        }
    },
    createReview: async (bookId, userId, rating, reviewText) => {
        const query = `
            INSERT INTO reviews (book_id, user_id, rating, review_text, created_at)
            VALUES ($1, $2, $3, $4, NOW())
        `;
        try {
            await pool.query(query, [parseInt(bookId), parseInt(userId), parseInt(rating), reviewText]);
        } catch (error) {
            console.error('Database error while inserting review:', error);
            throw error;
        }
    },
    getBooks: async (searchTerm = '', category = '') => {
        let query = 'SELECT * FROM books';
        let values = [];

        if (searchTerm || category) {
            query += ' WHERE';
            let conditions = [];

            if (searchTerm) {
                conditions.push(`title ILIKE $${conditions.length + 1} OR description ILIKE $${conditions.length + 1}`);
                values.push(`%${searchTerm}%`);
            }

            if (category) {
                conditions.push(`id IN (SELECT book_id FROM category_book WHERE category_id = $${conditions.length + 1})`);
                values.push(category);
            }

            query += conditions.join(' AND ');
        }

        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (err) {
            throw err;
        }

    },
    filterBooks: async (userId, categoryId, title) => {
        let query = `
        SELECT books.*
        FROM books
        LEFT JOIN category_book ON books.id = category_book.book_id
        WHERE books.id NOT IN (
            SELECT book_id FROM purchased_books WHERE user_id = $1
        )
    `;
        const params = [userId];

        if (categoryId) {
            query += ` AND category_book.category_id = $2`;
            params.push(categoryId);
        }

        if (title) {
            query += ` AND books.title ILIKE $${params.length + 1}`;
            params.push(`%${title}%`);
        }

        query += ` ORDER BY books.title`;

        try {
            const { rows } = await pool.query(query, params);
            return rows;
        } catch (error) {
            console.error('Database error while filtering books:', error);
            throw error;
        }
    },
    getPurchasedBooksByUser: async (userId) => {
        const query = `
        SELECT b.id, b.title, b.author, b.file_path, b.image_path
        FROM purchased_books pb
        JOIN books b ON pb.book_id = b.id
        WHERE pb.user_id = $1
    `;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    },

    getFilteredPurchasedBooksByUser: async (userId, categoryId, title) => {
        let query = `
        SELECT b.id, b.title, b.author, b.file_path, b.image_path
        FROM purchased_books pb
        JOIN books b ON pb.book_id = b.id
        LEFT JOIN category_book cb ON b.id = cb.book_id
        WHERE pb.user_id = $1
    `;
        const params = [userId];

        if (categoryId) {
            query += ` AND cb.category_id = $2`;
            params.push(categoryId);
        }

        if (title) {
            query += ` AND b.title ILIKE $${params.length + 1}`;
            params.push(`%${title}%`);
        }

        query += ` ORDER BY b.title`;

        try {
            const { rows } = await pool.query(query, params);
            return rows;
        } catch (error) {
            console.error('Database error while filtering purchased books:', error);
            throw error;
        }
    }
};



module.exports = User;
