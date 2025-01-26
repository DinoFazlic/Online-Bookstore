const allowRoles = (...roles) => {
    return (req, res, next) => {
        const user = req.user; // Assuming `req.user` is populated by `verifyToken`

        // Check if user exists and has the correct role
        if (!user || !roles.includes(user.role)) {
            console.log(`Access denied: User role "${user?.role}" not allowed`);
            return res.status(403).render('error', { message: 'Access Denied: You do not have permission to access this page.' });
        }

        next(); // Allow access if role matches
    };
};

module.exports = allowRoles;
