const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const User = require('../../models/User');

const demoMps = [
  {
    name: 'Hon. Rajesh Kumar, MP',
    email: 'mp@civicsense.ai',
    password: 'password123',
    role: 'mp',
    constituency: 'Bengaluru Central',
    verified: true
  },
  {
    name: 'Hon. Shalini Patil, MP',
    email: 'mumbai@civicsense.ai',
    password: 'password123',
    role: 'mp',
    constituency: 'Mumbai South',
    verified: true
  },
  {
    name: 'Hon. Aditya Sharma, MP',
    email: 'delhi@civicsense.ai',
    password: 'password123',
    role: 'mp',
    constituency: 'New Delhi',
    verified: true
  },
  {
    name: 'Hon. K. Srinivasan, MP',
    email: 'chennai@civicsense.ai',
    password: 'password123',
    role: 'mp',
    constituency: 'Chennai Central',
    verified: true
  },
  {
    name: 'Hon. Amit Banerjee, MP',
    email: 'kolkata@civicsense.ai',
    password: 'password123',
    role: 'mp',
    constituency: 'Kolkata Uttar',
    verified: true
  }
];

const seedMp = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not set in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully...');

    // Remove existing demo users
    const emails = demoMps.map(mp => mp.email);
    await User.deleteMany({ email: { $in: emails } });

    // Create the demo MPs
    await User.insertMany(demoMps);

    console.log('MP Accounts seeded successfully!');
    demoMps.forEach(mp => {
      console.log(`- ${mp.constituency}: ${mp.email} (Password: password123)`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed MP accounts:', error.message);
    process.exit(1);
  }
};

seedMp();
