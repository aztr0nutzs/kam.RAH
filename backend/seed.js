// P1-3: Seed script for initial data
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load env vars from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Load models
const Camera = require('../models/Camera'); // Assuming model path
const User = require('../models_or_placeholder/User'); // See NOTE below
const Task = require('../models/Task');

// --- NOTE ---
// The file `userRoutes.js` exists, but the `User` model was never created.
// This script will use a placeholder. To make this fully work,
// a `backend/models/User.js` file is required, similar to `Task.js`.
//
// For demonstration, I will create a minimal placeholder model if User doesn't exist.
let UserModel;
try {
  UserModel = User;
} catch (e) {
  console.warn('User model not found. Using minimal placeholder for seeding.');
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  });
  UserModel = mongoose.model('User', userSchema);
}
// --- End Note ---


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Connect to DB
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Task.deleteMany({});
    await Camera.deleteMany({});
    await UserModel.deleteMany({});

    // --- Create Admin User ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword', salt);

    const [adminUser] = await UserModel.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      }
    ]);
    console.log('Admin user created: admin@example.com / adminpassword');

    // --- Create Sample Cameras ---
    const cameras = [
      {
        name: 'Lobby Entrance',
        type: 'IP',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        status: 'ONLINE',
        ping: 15,
        signal: 98,
        isFavorite: true,
        location: 'Main Lobby',
        tags: ['indoor', 'public'],
        settings: {
          brightness: 100,
          contrast: 100,
          isNightVision: false,
          resolution: '1080p',
          fps: 30,
          bitrate: 4096,
          codec: 'H.264',
          ptz: { enabled: true, presets: [{ name: 'Door', value: 'p1' }] },
          motionDetection: { enabled: true, sensitivity: 75 },
          recording: { mode: 'motion', retentionDays: 30 },
        },
      },
      {
        name: 'Parking Lot (Offline)',
        type: 'IP',
        url: 'rtsp://invalid.url',
        status: 'OFFLINE',
        ping: -1,
        signal: -1,
        isFavorite: false,
        location: 'Exterior',
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        tags: ['outdoor', 'parking'],
        settings: {
          brightness: 100,
          contrast: 100,
          isNightVision: false,
          resolution: '720p',
          fps: 15,
          bitrate: 2048,
          codec: 'H.264',
          ptz: { enabled: false, presets: [] },
          motionDetection: { enabled: true, sensitivity: 90 },
          recording: { mode: 'off', retentionDays: 7 },
        },
      }
    ];
    
    await Camera.create(cameras);
    console.log(`${cameras.length} cameras created.`);

    // --- Create Sample Task ---
    await Task.create([
      {
        title: 'Review parking lot footage',
        description: 'Check footage from 6 PM to 8 PM for suspicious activity.',
        status: 'pending',
        ownerId: adminUser._id,
      }
    ]);
    console.log('Sample task created.');

    console.log('\nSeed data successfully imported!');
    mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedData();