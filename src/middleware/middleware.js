const jwt = require('jsonwebtoken');

// Middleware to fetch user based on JWT token
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token'); // The token should be passed in the header as 'auth-token'

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, 'secret_ecom'); // Replace 'secret_ecom' with your secret key
        req.user = decoded.user; // Attach user info to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = fetchUser;
