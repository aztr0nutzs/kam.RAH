const mongoose = require('mongoose');

/**
 * Mongoose Schema for a Task
 */
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: false,
    default: '',
  },
  status: {
    type: String,
    required: true,
    enum: {
        values: ['pending', 'running', 'completed', 'failed'],
        message: '{VALUE} is not a supported status'
    },
    default: 'pending',
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Assumes a 'User' model exists for relations
  },
  meta: {
    type: mongoose.Schema.Types.Mixed, // For flexible JSON data
    required: false,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Create and export the Task model
module.exports = mongoose.model('Task', taskSchema);