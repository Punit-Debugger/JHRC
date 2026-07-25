const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
    try {
        // Read Authorization header
        const authHeader = req.headers.authorization;

        // Check if Authorization header is provided
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Validate Bearer format
        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format."
            });
        }

        const token = parts[1];

        // Check if JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "JWT configuration error."
            });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded payload to req.admin
        req.admin = decoded;

        // Continue to next middleware/route
        next();

    } catch (error) {
        // JWT verification failed
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

module.exports = authenticateAdmin;
