import 'dotenv/config.js';
import mongoose from 'mongoose';
import Course from './models/Course.js';

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const testResources = [
      { name: 'Web Link', url: 'https://res.cloudinary.com/dmnapin56/raw/upload/v1779093850/udemy_uploads/aeiheaeztjzdocgfbimh', resourceType: 'link' },
      { name: 'Test PDF', url: 'https://example.com/test.pdf', resourceType: 'pdf' }
    ];

    const updated = await Course.findByIdAndUpdate(
      '6a0ad15c77212f36a8b22fe7',
      { $set: { resources: testResources } },
      { new: true }
    );
    console.log('SUCCESS! Resources:', JSON.stringify(updated.resources, null, 2));

    // Restore original
    await Course.findByIdAndUpdate(
      '6a0ad15c77212f36a8b22fe7',
      { $set: { resources: [{ name: 'Web Link', url: 'https://res.cloudinary.com/dmnapin56/raw/upload/v1779093850/udemy_uploads/aeiheaeztjzdocgfbimh', resourceType: 'link' }] } },
      { new: true }
    );
    console.log('Restored original.');
    process.exit(0);
  } catch (err) {
    console.error('FAILED:', err.message);
    process.exit(1);
  }
};
test();
