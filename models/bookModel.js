const { Pool } = require('pg'); // PostgreSQL konfiguracija
const pool = require('../config/db');

const Book = {

    create: async (title, author, description, price, pdf_path, image_path) => {
        //console.log('Inserting into database create log...');
        const query = `
        INSERT INTO books (title, author, description, price, file_path, image_path)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    `;
        try {
            const result = await pool.query(query, [title, author, description, price, pdf_path, image_path]);
            console.log('Insert successful!');
            return result.rows[0]; // Vraća objekat sa ID-om knjige
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    },

    getAll: async () => {
        const query = 'SELECT * FROM books ORDER BY created_at DESC'; // Sortirano po datumu kreiranja
        try {
            const { rows } = await pool.query(query); // Izvrši upit
            return rows; // Vrati niz knjiga
        } catch (error) {
            console.error('Database error while fetching books:', error);
            throw error; // Propusti grešku dalje
        }
    },
    getById: async (id) => {
        const query = 'SELECT * FROM books WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },
    update: async (id, title, author, description, price) => {
        const query = `
        UPDATE books
        SET title = $2,
            author = $3,
            description = $4,
            price = $5
        WHERE id = $1 
    `;
        console.log('Executing query:', query);
        console.log('With values:', [title, author, description, price, id]);
        await pool.query(query, [id, title, author, description, price]);
    },
    delete: async (id) => {
        const query = `
        DELETE FROM books
        WHERE id = $1
    `;
        try {
            console.log('Executing delete query:', query);
            console.log('With ID:', id);
            await pool.query(query, [id]);
        } catch (error) {
            console.error('Database error while deleting book:', error);
            throw error;
        }
    },
    addCategory: async (bookId, categoryId) => {
        const query = `
        INSERT INTO category_book (book_id, category_id)
        VALUES ($1, $2)
    `;
        try {
            console.log('Associating category with book:', { bookId, categoryId });
            await pool.query(query, [bookId, categoryId]);
        } catch (error) {
            console.error('Database error while associating category with book:', error);
            throw error;
        }
    },
    getCategory: async (bookId) => {
        const query = `
        SELECT categories.id, categories.name
        FROM categories
        JOIN category_book ON categories.id = category_book.category_id
        WHERE category_book.book_id = $1
    `;
        try {
            const { rows } = await pool.query(query, [bookId]);
            return rows[0]; // Vraća trenutnu kategoriju
        } catch (error) {
            console.error('Database error while fetching category:', error);
            throw error;
        }
    },
    updateCategory: async (bookId, categoryId) => {
        const query = `
        UPDATE category_book
        SET category_id = $1
        WHERE book_id = $2
    `;
        try {
            await pool.query(query, [categoryId, bookId]);
        } catch (error) {
            console.error('Database error while updating category:', error);
            throw error;
        }
    },
    filter: async (categoryId, title) => {
        let query = `
        SELECT books.*
        FROM books
        LEFT JOIN category_book ON books.id = category_book.book_id
        WHERE 1 = 1
    `;
        const params = [];

        if (categoryId) {
            query += ' AND category_book.category_id = $1';
            params.push(categoryId);
        }

        if (title) {
            query += ` AND books.title ILIKE $${params.length + 1}`;
            params.push(`%${title}%`);
        }

        query += ' ORDER BY books.title';

        try {
            const { rows } = await pool.query(query, params);
            return rows;
        } catch (error) {
            console.error('Database error while filtering books:', error);
            throw error;
        }
    }

};

module.exports = Book;
