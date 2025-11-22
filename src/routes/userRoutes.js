const express = require("express");
const router = express.Router();

const { jwtVerificationMiddleware } = require("../middleware/jwtVerification");
const { getUserProfile, getAllProfiles } = require("../controllers/userController");
const { cacheMiddleware } = require("../middleware/cache");

router.use(jwtVerificationMiddleware);
router.get("/getUserProfile", cacheMiddleware((req) => `user:profile:${req.user._id}`), getUserProfile);
router.get("/getAllProfiles", cacheMiddleware((req) => `user:profiles:${req.user._id}:${req.user.role}`), getAllProfiles);

module.exports = router;
