import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    required: true,
    // TODO: Rework with enum
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  grade: {
    type: Number,
    max: 100,
    min: 0,
  },
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;
