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
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['assignment', 'exam', 'project', 'quiz', 'test', 'homework'],
  },
  description: {
    type: String,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  grade: {
    type: Number,
    max: 100,
    min: 0,
    default: null,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  start: {
    type: Date,
  },
  end: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
  },
  color: {
    type: String,
    match: /^#[0-9A-Fa-f]{6}$/,
  },
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;
