const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../config/redis");
const User = require("../models/User");

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) return 3;

      if (user.role === "admin") {
        return 0;
      }
      return 3;

    } catch (err) {
      return 3;
    }
  },

  skip: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (user && user.role === "admin") return true;

      return false;
    } catch (err) {
      return false;
    }
  },

  keyGenerator: (req, res) => {
    return req.body.email || req.ip;
  },

  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),

  message: {
    message: "Too many login attempts. Try again after 1 hour.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };
