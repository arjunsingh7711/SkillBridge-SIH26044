const jwt = require("jsonwebtoken");


// ========================================
// AUTH MIDDLEWARE
// ========================================

const authMiddleware = (req, res, next) => {

    try {

        // Get token from Authorization header
        const authHeader =
            req.headers.authorization;


        // Check token
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                message: "Authentication required"
            });

        }


        // Extract token
        const token =
            authHeader.split(" ")[1];


        // Verify token
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Store user information in request
        req.user = decoded;


        // Continue
        next();


    } catch (error) {

        console.error(
            "AUTH MIDDLEWARE ERROR:",
            error
        );


        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }

};


module.exports = authMiddleware;
