import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/**
 * ✅ Admin-Only Middleware: Checks if user is authenticated AND is a verified admin
 * Prevents any non-admin user from accessing admin endpoints
 * Prevents spam users from accessing admin dashboard
 */
const isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        // 🔍 DEBUG: Log authentication attempt
        console.log('🔍 Admin auth attempt:', {
            hasToken: !!token,
            tokenLength: token ? token.length : 0,
            cookies: Object.keys(req.cookies || {}),
            userAgent: req.headers['user-agent']?.substring(0, 50)
        });
        
        // ✅ Check 1: Token exists
        if (!token) {
            console.log('❌ Admin auth failed: No token');
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        // ✅ Check 2: Verify token validity
        const decode = await jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
        if (!decode) {
            console.log('❌ Admin auth failed: Invalid token decode');
            return res.status(401).json({
                message: "Invalid token",
                success: false,
            });
        }

        console.log('🔍 Token decoded:', { userId: decode.userId });

        // ✅ Check 3: Fetch user from database
        const user = await User.findById(decode.userId);
        if (!user) {
            console.log('❌ Admin auth failed: User not found for ID:', decode.userId);
            return res.status(401).json({
                message: "User not found",
                success: false,
            });
        }

        console.log('🔍 User found:', {
            id: user._id,
            email: user.email,
            role: user.role,
            verificationStatus: user.verificationStatus,
            isVerified: user.isVerified
        });

        // ✅ Check 4: Verify user is an admin
        if (user.role !== 'admin') {
            console.log('❌ Admin auth failed: User is not admin, role:', user.role);
            return res.status(403).json({
                message: "Only admins can access this resource",
                success: false,
            });
        }

        // ✅ Check 5: Verify admin account is legitimate
        if (!user.verificationStatus || user.verificationStatus === 'rejected') {
            console.log('❌ Admin auth failed: Invalid verification status:', user.verificationStatus);
            return res.status(403).json({
                message: "Admin account verification failed",
                success: false,
            });
        }

        console.log('✅ Admin auth successful for:', user.email);

        // ✅ Check 6: Set user ID and user in request for use in controllers
        req.id = decode.userId;
        req.user = user;
        next();

    } catch (error) {
        console.error("❌ Admin Middleware Error:", error);
        return res.status(401).json({
            message: "Authentication failed",
            success: false,
        });
    }
};

export default isAdmin;
