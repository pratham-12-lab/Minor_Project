import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Optional authentication middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            // No token provided - continue as anonymous user
            req.user = null;
            req.id = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
        
        if (!decoded) {
            // Invalid token - continue as anonymous user
            req.user = null;
            req.id = null;
            return next();
        }

        const user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
            // User not found - continue as anonymous user
            req.user = null;
            req.id = null;
            return next();
        }

        req.user = user;
        req.id = user._id;
        next();
        
    } catch (error) {
        // Token verification failed - continue as anonymous user
        req.user = null;
        req.id = null;
        next();
    }
};

export default optionalAuth;