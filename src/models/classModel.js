import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  classType: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial'],
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  events: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
  },
  topics: {
    type: [
      {
        type: String,
        required: true,
      },
    ],
  },
});

export default mongoose.model('Class', classSchema);
