const User = require("../models/User");
const Task = require("../models/Task");

exports.getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User Unauthorized" });
    }

    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile retrieved successfully",
      data: user
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

exports.getAllProfiles = async (req, res) => {
  try {
    const user = req.user;
    let users = [];

    if (user.role === 'admin') {
      users = await User.find({}, 'name email username role');
    } 
    else if (user.role === 'manager') {
      const tasks = await Task.find({ createdBy: user.userId || user.id || user._id }, 'assignedTo');
      const userIds = [...new Set(
          tasks
            .map(t => t.assignedTo)
            .filter(u => u)
            .map(u => u.toString())
        )];

      users = await User.find({ _id: { $in: userIds } }, 'name email username role');
    } 
    else if (user.role === 'user') {
      users = await User.find({ _id: user.userId || user.id || user._id }, 'name email username role');
    } 
    else {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ message: "Profiles fetched successfully", users });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error while fetching profiles",
      error: error.message
    });
  }
};
