const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const User = require('../../models/User');

const seedMp = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not set in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully...');

    // Remove existing demo user
    await User.deleteMany({ email: 'mp@civicsense.ai' });

    // Create the demo MP
    await User.create({
      name: 'Hon. Rajesh Kumar, MP',
      email: 'mp@civicsense.ai',
      password: 'password123', // Will be automatically hashed by User schema pre-save hook
      role: 'mp',
      constituency: 'Bengaluru Central'
    });

    console.log('MP Account seeded successfully!');
    console.log('Email: mp@civicsense.ai');
    console.log('Password: password123');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed MP account:', error.message);
    process.exit(1);
  }
};

seedMp();
