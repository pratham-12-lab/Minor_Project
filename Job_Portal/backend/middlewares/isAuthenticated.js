import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        // Check for token in cookies first, then in Authorization header
        let token = req.cookies.token;
        
        // If no token in cookies, check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }
        
        console.log('🔐 Authentication check:', {
            hasCookieToken: !!req.cookies.token,
            hasAuthHeader: !!req.headers.authorization,
            hasToken: !!token,
            path: req.path
        });
        
        if (!token) {
            console.log('❌ No token found in request');
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            })
        }
        
        const decode = await jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
        if(!decode){
            console.log('❌ Invalid token decode');
            return res.status(401).json({
                message:"Invalid token",
                success:false
            })
        };
        
        console.log('✅ Authentication successful for user:', decode.userId);
        req.id = decode.userId;
        next();
    } catch (error) {
        console.log('❌ Authentication error:', error.message);
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false,
        });
    }
}
export default isAuthenticated;