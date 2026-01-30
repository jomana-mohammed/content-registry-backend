const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async (uri) => {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  const connectionUri = uri || process.env.MONGODB_URI;

  if (!connectionUri) {
    console.error('❌ MongoDB URI is missing');
    process.exit(1);
  }

  try {
    await mongoose.connect(connectionUri);
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};


// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err.message}`);
});

module.exports = connectDB;