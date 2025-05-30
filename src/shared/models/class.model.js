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

const Class = mongoose.models.Class || mongoose.model('Class', classSchema);
export default Class;
