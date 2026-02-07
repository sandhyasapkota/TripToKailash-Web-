import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authenticateToken = (req, res, next) => {
    if(req.path === '/api/login/' || req.path === '/api/register/' || req.path === '/api/forgot-password/' ) {
        return next();
    }
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid access token' });
        }
        req.user = decoded;
        next();
    });
};

export { authenticateToken };