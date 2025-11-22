const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },

  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },

  dueDate: {
    type: Date,
    default: null
  },

  status: {
    type: String,
    enum: ['pending', 'complete'],
    default: 'pending'
  }

}, { timestamps: true });


TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });


module.exports = mongoose.model('Task', TaskSchema);
