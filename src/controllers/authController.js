const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwtService = require("../services/jwtToken");
const redisClient = require("../config/redis");

//register user
exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
            message: "User with this email or username already exists",
            "error": error.message 
        });
    }
        res.status(500).json({ 
            message: "Internal Server error",
            "error": error.message 
        });
  }
};

//login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User does not exist.",
      });
    }

  
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const jwtPayload = { _id: user._id, email: user.email, role: user.role }
    const token = jwtService.jwtSign(jwtPayload);
    
    res.status(200).json({
      message: "Login successful",
      user: {
        username: user.username,
        email: user.email,
      },
      token
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// logout user
exports.logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(400).json({
                message: "No Token in Header"
            });
        }

        const isBlacklisted = await redisClient.get(`blacklist_${token}`);
        if (isBlacklisted) {
            return res.status(400).json({
                message: "User already logged out"
            });
        }

        const decodedToken = jwtService.jwtVerify(token);
        const now = Math.floor(Date.now() / 1000);
        const ttl = decodedToken.exp - now;

        await redisClient.set(`blacklist_${token}`,
            "logout",
            {
                EX: ttl
            }
        );

        res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};
