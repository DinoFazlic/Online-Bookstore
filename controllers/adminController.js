const Book = require('../models/bookModel');
const Category = require('../models/categoryModel');
const { Op } = require("sequelize");


// Prikaz admin dashboarda
/*
exports.getAdminDashboard = async (req, res) => {
    //res.render('adminDashboard');
    try {
        const books = await Book.getAll(); // Dohvati sve knjige iz baze
        const categories = await Category.getAll();
        let currentCategory = null;

        if (req.query.edit) {
            const bookId = req.query.edit;
            currentCategory = await Category.getCategoriesForBook(bookId);  // Dohvati kategoriju za knjigu
        }

        res.render('adminDashboard', { books, categories, currentCategory: currentCategory ? currentCategory[0] : null  }); // Proslijedi knjige EJS šablonu
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).send('Error loading dashboard');
    }

};

 */
exports.getAdminDashboard = async (req, res) => {
    try {
        const { category, title } = req.query;

        // Dohvati sve kategorije za dropdown
        const categories = await Category.getAll();

        // Filtriraj knjige pomoću Book.filter metode
        const books = await Book.filter(category, title);

        // Trenutna kategorija (ako je u pitanju edit mode)
        let currentCategory = null;
        if (req.query.edit) {
            const bookId = req.query.edit;
            currentCategory = await Category.getCategoriesForBook(bookId); // Dohvati kategoriju za knjigu
        }

        // Renderuj stranicu sa filtriranim knjigama
        res.render('adminDashboard', {
            books,
            categories,
            selectedCategory: category || '',
            searchTitle: title || '',
            currentCategory: currentCategory ? currentCategory[0] : null, // Prosledi trenutnu kategoriju
        });
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        res.status(500).send('An error occurred while loading the admin dashboard.');
    }
};



// Prikaz forme za dodavanje knjige
exports.getAddBookForm = async (req, res) => {
    try {
        const categories = await Category.getAll(); // Dohvati sve kategorije
        res.render('addBook', { categories }); // Proslijedi kategorije šablonu
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error loading form');
    }
};

// Obrada dodavanja knjige
exports.addBook = async (req, res) => {
    console.log("route hit")
    const { title, author, description, price, category_id  } = req.body;

    try {
        console.log('Request body:', req.body);
        console.log('Uploaded files:', req.files);

        if (!req.files['pdf'] || !req.files['image']) {
            console.error('PDF or Image missing!');
            return res.status(400).send('Both PDF and Image files are required.');
        }

        //const pdfPath = `/uploads/books/${Date.now()}-${req.files['pdf'][0].originalname}`;
        //const imagePath = `/uploads/images/${Date.now()}-${req.files['image'][0].originalname}`;

        const pdfPath = `/uploads/books/${req.files['pdf'][0].filename}`;
        const imagePath = `/uploads/images/${req.files['image'][0].filename}`;

        console.log('PDF Path:', pdfPath);
        console.log('Image Path:', imagePath);

        console.log('Inserting into database...');
        const newBook = await Book.create(title, author, description, price, pdfPath, imagePath);

        const bookId = newBook.id;
        await Book.addCategory(bookId, category_id);


        console.log('Book created successfully:', newBook);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error adding book:', error.message);
        res.status(500).send('Error adding book');
    }
};

// Prikaz liste knjiga
exports.getBooksList = async (req, res) => {
    try {
        const books = await Book.getAll();
        res.render('booksList', { books });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).send('Error fetching books');
    }
};

exports.getEditBookForm = async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Book.getById(id);
        const categories = await Category.getAll(); // Dohvati sve kategorije
        const currentCategory = await Category.getCategoriesForBook(id); // Dohvati trenutnu kategoriju

        console.log('Book:', book);
        console.log('Categories:', categories);
        console.log('Current Category:', currentCategory);

        if (!book) {
            return res.status(404).send('Book not found');
        }
        res.render('adminDashboard', { book, categories, currentCategory: currentCategory[0]  });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).send('Error fetching book');
    }
};

exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, author, description, price, category_id  } = req.body;

    try {
        console.log('Full Request Body:', req.body); // Loguje cijelo tijelo zahtjeva
        console.log('Updating book with:', { title, author, description, price, category_id  });

        // Dohvati postojeće podatke knjige
        const book = await Book.getById(id);
        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Ažuriraj knjigu
        await Book.update(id, title, author, description, price);

        const existingCategory = await Book.getCategory(id);
        if (existingCategory && existingCategory.id !== parseInt(category_id)) {
            // Ako se kategorija promijenila, ažuriraj u tabeli category_book
            await Book.updateCategory(id, category_id);
        } else if (!existingCategory) {
            // Ako knjiga nema kategoriju, dodaj novu povezanost
            await Book.addCategory(id, category_id);
        }

        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).send('Error updating book');
    }
};
exports.deleteBook = async (req, res) => {
    const { id } = req.params; // ID knjige iz URL-a

    try {
        console.log(`Deleting book with ID: ${id}`);

        // Pozovi model za brisanje knjige
        await Book.delete(id);

        console.log('Book deleted successfully');
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).send('Error deleting book');
    }
};



