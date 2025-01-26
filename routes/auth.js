const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

const crypto = require('crypto');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the JWT token from cookies
    res.redirect('/auth/login'); // Redirect to login page
});


router.post('/login', login);

router.post('/register', register);

module.exports = router;