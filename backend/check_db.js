import 'dotenv/config.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import { connectCloudinary } from './config/cloudinary.js';

const checkDB = async () => {
  try {
    console.log('Testing Connections...');
    connectCloudinary();
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    console.log(`Users in Atlas DB: ${userCount}`);
    console.log(`Courses in Atlas DB: ${courseCount}`);
    
    console.log('All connections verified successfully!');
    process.exit();
  } catch (err) {
    console.error('Connection verification failed:', err);
    process.exit(1);
  }
};

checkDB();
