import mongoose from 'mongoose';

const communityMessageSchema = mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
    },
    attachments: [
      {
        url: String,
        name: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CommunityMessage = mongoose.model('CommunityMessage', communityMessageSchema);

export default CommunityMessage;
