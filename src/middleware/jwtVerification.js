// middleware/jwtVerification.js
const redisClient = require("../config/redis");
const jwtService = require("../services/jwtToken");

const jwtVerificationMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "User Unauthorized" });
        }

        const isBlackListed = await redisClient.get(`blacklist_${token}`);
        if (isBlackListed) {
            return res.status(401).json({ message: "Token is already expired." });
        }

        const decodedToken = jwtService.jwtVerify(token);
        req.user = decodedToken;
        next();

    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
};

module.exports = { jwtVerificationMiddleware };