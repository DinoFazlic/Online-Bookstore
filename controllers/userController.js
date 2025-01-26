const User = require('../models/userDashboardModel');
const pool = require('../config/db');
const Book = require('../models/bookModel');
const Category = require('../models/categoryModel');

exports.getUserDashboard = async (req, res) => {
    try {

        const user = await User.getUserById(req.user.id);

        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Render the dashboard with the user data
        res.render('userDashboard', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// top Up users credit
exports.topUpCredits = async (req, res) => {
    const { amount } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Validate the top-up amount
        const topUpAmount = parseFloat(amount);
        if (isNaN(topUpAmount) || topUpAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Update user credits in the database
        const updatedCredits = await User.topUpCredits(req.user.id, topUpAmount);

        if (updatedCredits !== null) {
            res.redirect('/users/topup');
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error during top-up:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// to get the shop
exports.getShop = async (req, res) => {
    const userId = req.user.id;
    const { category, title } = req.query;
    try {
        const categories = await Category.getAll(); // Dohvati sve kategorije iz baze
        let books;

        if (category || title) {
            // Ako postoji filter, pozovi metodu za filtriranje
            books = await User.filterBooks(userId, category, title);
        } else {
            // Ako nema filtera, dohvati sve knjige koje korisnik nije kupio
            books = await User.getAllExcludingPurchased(userId);
        }

        // Proslijedi knjige i kategorije šablonu
        res.render('shop', { books, categories, selectedCategory: category, searchTitle: title });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).send('An error occurred while loading the shop.');
    }
}

exports.buyBook = async (req, res) => {
    const { bookId, bookPrice } = req.body;
    const userId = req.user.id; // Assuming user is stored in session

    try {
        // Get user credits
        const userCredits = await User.getUserCredits(userId);
        const userDecimal = parseFloat(userCredits);
        const bookDecimal = parseFloat(bookPrice);
        console.log(typeof userDecimal);
        console.log(typeof bookDecimal);
        console.log(userDecimal < bookDecimal);

        if (userDecimal < bookDecimal) {
            return res.redirect('/users/shop?error=notEnoughCredits');
        }

        // Deduct credits
        const updatedCredits = userDecimal - bookDecimal;
        await User.updateUserCredits(userId, updatedCredits);

        // Insert into purchased_books
        await User.insertPurchasedBook(userId, bookId);

        // Respond with success
        res.redirect('/users/shop'); // Redirect back to the shop page
    } catch (error) {
        console.error('Error processing purchase:', error);
        res.status(500).send('An error occurred while processing the purchase.');
    }
}


exports.getReviews = async (req, res) => {
    const bookId = req.params.bookId;
    const source = req.query.source || 'shop'; // Default to 'shop' if no source is provided
    try {
        const reviews = await User.getByBookId(bookId); // Fetch reviews for the book
        const bookQuery = 'SELECT * FROM books WHERE id = $1';
        const bookResult = await pool.query(bookQuery, [bookId]);
        const book = bookResult.rows[0];
        res.render('reviews', { book, reviews, source }); // Pass source to the view
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send('An error occurred while loading the reviews.');
    }
};

exports.submitReview = async (req, res) => {
    const bookId = req.params.bookId;
    const { rating, review_text } = req.body;
    const userId = req.user.id; // Assuming user ID is available from the session or authentication system
    parseInt(rating);
    parseInt(userId);
    parseInt(bookId);
    try {
        await User.createReview(
            bookId,
            userId,
            rating, // Ensure rating is parsed as integer
            review_text
        );

        res.redirect(`/users/reviews/${bookId}`); // Redirect back to reviews page
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).send('An error occurred while submitting the review.');
    }
};

exports.searchBooks = async (req, res) => {
    const { searchTerm, category } = req.query;

    try {
        const books = await User.getBooks(searchTerm, category);
        res.render('shop', { books });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).send('An error occurred while searching for books.');
    }
};


exports.showPurchasedBooks = async (req, res) => {
    const userId = req.user.id; // Assuming session stores logged-in user's info
    const { category, title } = req.query; // Retrieve filters from query parameters

    try {
        const categories = await Category.getAll(); // Fetch all categories
        let purchasedBooks;

        if (category || title) {
            // If filters are applied, use the filtering method
            purchasedBooks = await User.getFilteredPurchasedBooksByUser(userId, category, title);
        } else {
            // If no filters are applied, fetch all purchased books for the user
            purchasedBooks = await User.getPurchasedBooksByUser(userId);
        }

        // Render the EJS template with filtered purchased books and categories
        res.render('myBooks', {
            purchasedBooks,
            categories,
            selectedCategory: category,
            searchTitle: title
        });
    } catch (error) {
        console.error('Error fetching purchased books:', error);
        res.status(500).send('An error occurred while fetching your purchased books.');
    }
};
