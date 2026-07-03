const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Attempting connection with Mongoose 7/8 best practices
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_dss_dev', {
      // These options are mostly defaults now in Mongoose 6+, but explicitly set for robustness
      autoIndex: true, 
      maxPoolSize: 10, 
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000, 
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    // In production, we might want to alert operations before exiting
    process.exit(1); 
  }
};

module.exports = connectDB;
