const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload'); // Multer konfiguracija za fajlove
const Book = require('../models/bookModel');
const adminController = require('../controllers/adminController');

/* GET users listing. */
router.get('/', verifyToken, allowRoles('admin'), adminController.getAdminDashboard);

// Forma za dodavanje knjige
router.get('/books/add', verifyToken, allowRoles('admin'), adminController.getAddBookForm);

// Ruta za upload knjige (PDF + slika)
router.post('/books/add', upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), adminController.addBook);


// Prikaz liste knjiga
router.get('/books', verifyToken, allowRoles('admin'), adminController.getBooksList);

// Prikaz forme za uređivanje knjige
router.get('/books/edit/:id', verifyToken, allowRoles('admin'), adminController.getEditBookForm);

// Obrada ažuriranja knjige
router.post('/books/edit/:id', verifyToken, allowRoles('admin'), adminController.updateBook);

// Ruta za brisanje knjige
router.post('/books/delete/:id', verifyToken, allowRoles('admin'), adminController.deleteBook);

module.exports = router;
