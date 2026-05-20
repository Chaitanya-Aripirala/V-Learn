import 'dotenv/config.js';
import mongoose from 'mongoose';

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');
    const usersCollection = mongoose.connection.db.collection('users');
    const u = await usersCollection.findOne({ email: 'aripiralachaitanya1@gmail.com' });
    console.log(`User: ${u.name}`);
    console.log(`- enrolledCourses:`, JSON.stringify(u.enrolledCourses, null, 2));

    const u2 = await usersCollection.findOne({ email: 'student@test.com' });
    if (u2) {
      console.log(`User 2: ${u2.name}`);
      console.log(`- enrolledCourses:`, JSON.stringify(u2.enrolledCourses, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
