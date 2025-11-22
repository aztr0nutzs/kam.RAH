const mongoose = require('mongoose');

const cameraSettingsSchema = new mongoose.Schema({
  brightness: { type: Number, default: 100, min: 0, max: 200 },
  contrast: { type: Number, default: 100, min: 0, max: 200 },
  isNightVision: { type: Boolean, default: false },
  resolution: { type: String, enum: ['1080p', '720p', '480p'], default: '1080p' },
  fps: { type: Number, default: 30 },
  bitrate: { type: Number, default: 4096 },
  codec: { type: String, enum: ['H.264', 'H.265'], default: 'H.264' },
  ptz: {
    enabled: { type: Boolean, default: false },
    presets: [{ name: String, value: String }],
  },
  motionDetection: {
    enabled: { type: Boolean, default: true },
    sensitivity: { type: Number, default: 80 },
  },
  recording: {
    mode: { type: String, enum: ['continuous', 'motion', 'schedule', 'off'], default: 'motion' },
    retentionDays: { type: Number, default: 7 },
  },
}, { _id: false });

const cameraSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true, // For multi-user systems
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['IP', 'USB', 'Android'],
    default: 'IP',
  },
  url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['ONLINE', 'OFFLINE', 'RECORDING'],
    default: 'ONLINE',
  },
  // These would be dynamic in a real system
  ping: { type: Number, default: 0 },
  signal: { type: Number, default: 0 },
  lastSeen: { type: Date, default: Date.now },
  // These are user-specific preferences, should be in a separate collection for a multi-user system
  isFavorite: { type: Boolean, default: false }, 
  location: { type: String, default: 'Uncategorized' },
  tags: [String],
  settings: {
    type: cameraSettingsSchema,
    default: () => ({})
  },
}, {
  timestamps: true,
});

// Rename _id to id for frontend compatibility
cameraSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
cameraSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
    }
});


const Camera = mongoose.model('Camera', cameraSchema);
module.exports = Camera;
