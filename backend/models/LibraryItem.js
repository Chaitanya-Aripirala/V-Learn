import mongoose from 'mongoose';

const libraryItemSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    itemType: {
      type: String,
      enum: ['link', 'pdf', 'image'],
      required: true,
    },
    content: {
      type: String, // URL for links, or filename for GridFS (PDF/Image)
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentorName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const LibraryItem = mongoose.model('LibraryItem', libraryItemSchema);

export default LibraryItem;
