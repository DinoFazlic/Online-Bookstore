const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.log('Authentication failed: Token not provided.');
        return res.redirect('/auth/login'); // Redirect to login if no token
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user information to request
        next(); // Proceed to the next middleware or route
    } catch (err) {
        res.redirect('/auth/login'); // Redirect if token is invalid
    }
};

// Correctly export verifyToken
module.exports = verifyToken;
