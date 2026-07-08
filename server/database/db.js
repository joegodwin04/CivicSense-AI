const mongoose = require("mongoose");
const dns = require("dns");
const logger = require("../utils/logger");
const User = require("../models/User");

// Force Google Public DNS to resolve MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {
  logger.warn(`Failed to set custom DNS servers: ${err.message}`);
}

const seedAdmins = async () => {
  try {
    const admin1Email = "admin1@gmail.com";
    const admin2Email = "admin2@gmail.com";

    const admin1 = await User.findOne({ email: admin1Email });
    if (!admin1) {
      await User.create({
        name: "Admin One",
        email: admin1Email,
        password: "123456",
        role: "admin",
        constituency: "National HQ",
        verified: true
      });
      logger.info(`Seeded Admin: ${admin1Email}`);
    }

    const admin2 = await User.findOne({ email: admin2Email });
    if (!admin2) {
      await User.create({
        name: "Admin Two",
        email: admin2Email,
        password: "234567",
        role: "admin",
        constituency: "State HQ",
        verified: true
      });
      logger.info(`Seeded Admin: ${admin2Email}`);
    }
  } catch (err) {
    logger.error(`Error seeding admin accounts: ${err.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    await seedAdmins();
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;