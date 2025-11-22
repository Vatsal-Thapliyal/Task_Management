const { check, validationResult } = require("express-validator");

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const validateRegister = [
  check("username", "Username is required").not().isEmpty(),

  check("email", "Please provide a valid email").isEmail(),

  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .matches(strongPasswordRegex)
    .withMessage(
      "Password must be at least 8 characters long, include uppercase, lowercase, number and symbol"
    ),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateRegister };
