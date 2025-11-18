
const mongoose = require('mongoose');

const connectDB = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    console.error('Mongo connection string (MONGO_URI) is not defined.');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected to ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`Mongo connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
