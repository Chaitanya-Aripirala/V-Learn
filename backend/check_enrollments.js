import 'dotenv/config.js';
import mongoose from 'mongoose';

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');
    const enrollmentsCollection = mongoose.connection.db.collection('enrollments');
    const enrollments = await enrollmentsCollection.find({}).toArray();
    console.log(`Found ${enrollments.length} enrollments:`);
    for (const e of enrollments) {
      const user = await mongoose.connection.db.collection('users').findOne({ _id: e.user });
      const course = await mongoose.connection.db.collection('courses').findOne({ _id: e.course });
      console.log(`User: ${user?.name} (email: ${user?.email})`);
      console.log(`- Enrolled in Course: "${course?.title}" (ID: ${course?._id})`);
      console.log(`- Course Resources:`, JSON.stringify(course?.resources, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
