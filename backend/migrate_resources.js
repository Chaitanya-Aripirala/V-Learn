import 'dotenv/config.js';
import mongoose from 'mongoose';

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for raw migration...');

    // Fetch raw documents bypassing Mongoose schema
    const coursesCollection = mongoose.connection.db.collection('courses');
    const courses = await coursesCollection.find({}).toArray();
    console.log(`Found ${courses.length} courses in MongoDB.`);

    let updatedCount = 0;
    for (const courseDoc of courses) {
      const rawResources = courseDoc.resources;
      
      if (typeof rawResources === 'string') {
        const trimmed = rawResources.trim();
        let newResources = [];
        
        if (trimmed !== '') {
          let name = 'Course Material';
          let type = 'other';
          if (trimmed.toLowerCase().endsWith('.pdf')) {
            name = 'PDF Document';
            type = 'pdf';
          } else if (trimmed.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
            name = 'Image Resource';
            type = 'image';
          } else if (trimmed.includes('drive.google.com') || trimmed.includes('dropbox.com')) {
            name = 'Cloud Folder / Document';
            type = 'document';
          } else if (trimmed.startsWith('http')) {
            name = 'Web Link';
            type = 'link';
          }
          
          newResources = [{
            name: name,
            url: trimmed,
            resourceType: type
          }];
        }
        
        await coursesCollection.updateOne(
          { _id: courseDoc._id },
          { $set: { resources: newResources } }
        );
        updatedCount++;
        console.log(`Migrated course "${courseDoc.title}" from string to array in raw MongoDB.`);
      } else {
        console.log(`Course "${courseDoc.title}" resources field is already type: ${typeof rawResources}`);
      }
    }

    console.log(`Raw Migration complete! Successfully updated ${updatedCount} courses.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
