const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const { getUserDashboard, topUpCredits, getShop, buyBook, getReviews, submitReview, showPurchasedBooks} = require('../controllers/userController');


router.get('/', verifyToken, allowRoles('user'), getUserDashboard);

// Render the top-up page
router.get('/topup', verifyToken, allowRoles('user'),  (req, res) => {
  res.render('topup');
});

// Route for topping up credits
router.post('/topup', verifyToken, allowRoles('user'), topUpCredits);

//to get the shop
router.get('/shop', verifyToken, allowRoles('user'), getShop);

// Handle buy request
router.post('/buy', verifyToken, allowRoles('user'), buyBook);

// Route to display reviews for a specific book
router.get('/reviews/:bookId', verifyToken, allowRoles('user'), getReviews);

// Route to submit a new review
router.post('/reviews/:bookId/submit', verifyToken, allowRoles('user'), submitReview);

// Route to get users purchased books
router.get('/myBooks',verifyToken, allowRoles('user'), showPurchasedBooks);



module.exports = router;
