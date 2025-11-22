const express = require("express");
const router = express.Router();

const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimiter");
const { validateRegister } = require("../middleware/validateRegistration");

router.post("/register", validateRegister, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);

module.exports = router;