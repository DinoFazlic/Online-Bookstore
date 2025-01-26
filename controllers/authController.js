const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Ensure the correct path to your userModel

exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findByEmail(email);

        if (existingUser) {
            req.flash('error', 'User with this email already exists');
            return res.redirect('/auth/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newRole = role || 'user';

        const newUser = await User.create(username, email, hashedPassword, newRole);

        res.redirect('/auth/login');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};




exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set token in HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Ensure HTTPS in production
            maxAge: 3600000, // 1 hour
        });

        if (user.role === 'admin') {
            //console.log('Redirecting to admin dashboard');
            res.redirect('/admin');
        } else {
            //console.log('Redirecting to user dashboard');
            res.redirect('/users');
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


