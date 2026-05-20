import 'dotenv/config.js';
import mongoose from 'mongoose';
import Course from './models/Course.js';

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');
    const course = await Course.findById('6a0c378677581eb784e37887');
    console.log('Fetched via Mongoose:');
    console.log(JSON.stringify(course, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

test();
