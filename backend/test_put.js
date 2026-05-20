import 'dotenv/config.js';
import mongoose from 'mongoose';
import Course from './models/Course.js';

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');
    const course = await Course.findById('6a0bda3d088d1aae7075b2c1');
    console.log('Original course resources:', course.resources);
    
    // Simulate req.body assignment
    const reqBody = {
      resources: [
        {
          name: "Test Resource PDF",
          url: "https://example.com/test.pdf",
          resourceType: "pdf"
        }
      ]
    };
    
    Object.assign(course, reqBody);
    const updated = await course.save();
    console.log('Updated course resources after save:', updated.resources);
    
    // Reset back to empty
    course.resources = [];
    await course.save();
    console.log('Successfully reset course resources back to empty.');
    
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
};

test();
