const Task = require('../models/Task');
const User = require('../models/User');

const getValidatedUser = async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: user info missing in JWT" });
    return null;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(403).json({ message: "Invalid user. Operation not allowed." });
    return null;
  }

  return user;
};

// Create Task
exports.createTask = async (req, res) => {
  try {
    const { title, assignedTo, priority, dueDate, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title and assignedTo are required" });
    }

    const creator = await getValidatedUser(req, res);
    if (!creator) return;

    const assignee = await User.findOne({ username: assignedTo });
    if (!assignee) return res.status(404).json({ message: `Assigned user '${assignedTo}' not found` });

    if (assignee.role === 'admin') {
      return res.status(403).json({ message: "Tasks cannot be assigned to Admin users" });
    }

    const task = await Task.create({
      title,
      assignedTo: assignee._id,
      createdBy: creator._id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      status: status || 'pending'
    });

    await task.populate('assignedTo createdBy', 'username email role');
    
    res.status(201).json({ message: "Task created successfully", task });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error while creating task", error: error.message });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  try {
    const { title, assignedTo, priority, dueDate, status } = req.body;
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid taskId parameter" });
    }

    const user = await getValidatedUser(req, res);
    if (!user) return;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title) task.title = title;

    if (assignedTo) {
      const assignee = await User.findOne({ username: assignedTo });
      if (!assignee) return res.status(404).json({ message: `Assigned user '${assignedTo}' not found` });

      if (assignee.role === 'admin') {
        return res.status(403).json({ message: "Tasks cannot be assigned to Admin users" });
      }

      task.assignedTo = assignee._id;
    }

    if (priority && ['high', 'medium', 'low'].includes(priority)) task.priority = priority;
    if (status && ['pending', 'complete'].includes(status)) task.status = status;

    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid dueDate format" });
      }
      task.dueDate = date;
    }

    await task.save();
    await task.populate('assignedTo createdBy', 'username email role');

    res.status(200).json({ message: "Task updated successfully", task });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error while updating task", error: error.message });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const user = await getValidatedUser(req, res);
    if (!user) return;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error while deleting task", error: error.message });
  }
};


exports.getTasks = async (req, res) => {
  try {
    const user = await getValidatedUser(req, res);
    if (!user) return;

    const { status, priority } = req.query;

    const filter = {
      ...(user.role === 'manager' && { createdBy: user._id }),
      ...(user.role === 'user' && { assignedTo: user._id }),
      ...(status && ['pending', 'complete'].includes(status) && { status }),
      ...(priority && ['high', 'medium', 'low'].includes(priority) && { priority }),
    };

    const tasks = await Task.find(filter)
      .populate('assignedTo createdBy', 'username email role')
      .sort({ dueDate: 1 })
      .lean();

    res.status(200).json({
      message: "Tasks fetched successfully",
      tasks
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error while fetching tasks",
      error: error.message
    });
  }
};

