import 'dotenv/config.js';
import mongoose from 'mongoose';
import courses from './data/courses.js';
import Course from './models/Course.js';
import User from './models/User.js';
import connectDB from './config/db.js';

connectDB();

const importData = async () => {
  try {
    await Course.deleteMany();
    await User.deleteMany();

    // Create a default Mentor
    const mentor = await User.create({
      name: 'Test Mentor',
      email: 'mentor@example.com',
      password: 'password123',
      role: 'mentor',
      branch: 'Development'
    });

    // Create a default Student
    await User.create({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'user',
      branch: 'Development'
    });

    const sampleCourses = courses.map(c => ({ ...c, mentorId: mentor._id }));
    await Course.insertMany(sampleCourses);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Course.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
