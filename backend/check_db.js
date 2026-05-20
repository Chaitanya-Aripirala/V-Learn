import 'dotenv/config.js';
import mongoose from 'mongoose';

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');
    const coursesCollection = mongoose.connection.db.collection('courses');
    const courses = await coursesCollection.find({}).toArray();
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(c => {
      console.log(`Course Title: ${c.title}, ID: ${c._id}`);
      console.log(`- mentorId: ${c.mentorId}`);
      console.log(`- resources value:`, JSON.stringify(c.resources, null, 2));
    });

    const usersCollection = mongoose.connection.db.collection('users');
    const mentors = await usersCollection.find({ role: 'mentor' }).toArray();
    console.log(`Found ${mentors.length} mentors:`);
    mentors.forEach(m => {
      console.log(`Mentor Name: ${m.name}, ID: ${m._id}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
