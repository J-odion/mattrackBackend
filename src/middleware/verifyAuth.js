const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

const secret = process.env.JWT_SECRET;

// Middleware function for verifying JWT
function verifyToken(req, res, next) {
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Unauthorised access');
    }

    const token = authHeader.split(' ')[1];
    // JWT not present in header
    if (!token) {
        return res.status(401).send('Unauthorised access');
    }

    try {
        console.log("Now verifying token.");
        const decoded = jwt.verify(token, secret);
        // Add decoded user information to req object 
        req.user = decoded.user;
        console.log("Token verified.");
        next();
    } catch (err) {
        console.log("Token is invalid. 403 error returned to client.");
        // JWT present in cookies but is invalid
        res.status(403).send('Invalid token');
    }
}

module.exports = verifyToken;
