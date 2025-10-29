const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Checks the health of the MongoDB connection.
 * @returns {Promise<boolean>} - True if connected (readyState 1), false otherwise.
 */
const checkDBHealth = async () => {
  try {
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    return mongoose.connection.readyState === 1;
  } catch (error) {
    console.error('DB health check failed:', error);
    return false;
  }
};

module.exports = { connectDB, checkDBHealth };