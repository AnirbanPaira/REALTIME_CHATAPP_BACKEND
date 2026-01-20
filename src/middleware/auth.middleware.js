import jwt from "jsonwebtoken";
import User from "../models/users.models.js";

export const autentication = async (req, res, next) => {
    try {
        // First, try to get token from cookies
        let token = req.cookies.jwt;
        
        // If no cookie token, try Authorization header (Bearer token)
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }
        
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }
        const user = await User.findById(decode.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }
        req.user = user;
        next();

    } catch (error) {
        console.log('Error in authentication middleware', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
