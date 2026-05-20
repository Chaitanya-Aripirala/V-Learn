import mongoose from 'mongoose';

const courseSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [String],
    instructor: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/600x400'
    },
    videos: [
      {
        url: String,
        title: String,
        description: String,
        thumbnail: String
      },
    ],
    resources: [
      {
        name: {
          type: String,
          required: true
        },
        url: {
          type: String,
          required: true
        },
        resourceType: {
          type: String,
          enum: ['pdf', 'image', 'link', 'document', 'other'],
          default: 'other'
        }
      }
    ],
    liveLink: {
      type: String,
      default: ''
    },
    schedule: [
      {
        topic: String,
        date: String,
        time: String,
      }
    ],
    numStudents: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: 'Self-paced',
    },
    accessPeriod: {
      type: String,
      default: 'Lifetime',
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;
