import mongoose from 'mongoose';
import 'dotenv/config.js';
import Course from './models/Course.js';
import connectDB from './config/db.js';

const cleanup = async () => {
  try {
    await connectDB();
    
    // Remove courses that don't have a valid mentorId
    // or courses that were part of the initial seed/test data
    const result = await Course.deleteMany({
      $or: [
        { mentorId: { $exists: false } },
        { mentorId: null },
        { instructor: 'AI Assistant' },
        { title: /Demo/i },
        { title: /Test/i }
      ]
    });
    
    console.log(`${result.deletedCount} courses removed.`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

cleanup();
