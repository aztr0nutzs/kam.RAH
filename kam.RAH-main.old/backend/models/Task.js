const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'scheduled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    triggerType: {
      type: String,
      enum: ['manual', 'schedule', 'event'],
      default: 'manual',
    },
    schedule: {
      type: {
        cron: { type: String },
        timezone: { type: String, default: 'UTC' },
      },
      default: undefined,
    },
    targetCameras: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Camera',
      },
    ],
    action: {
      type: String,
      enum: ['record', 'stopRecord', 'snapshot', 'ptz', 'notify', 'custom'],
      default: 'record',
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed,
    },
    lastRunAt: { type: Date },
    nextRunAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

taskSchema.virtual('id').get(function getId() {
  return this._id.toHexString();
});

taskSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
