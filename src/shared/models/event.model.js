import mongoose from 'mongoose';

const recurrenceSchema = new mongoose.Schema(
  {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
    },
    interval: {
      type: Number,
      required: true,
      default: 1,
    },
    count: {
      type: Number,
      required: true,
    },
    daysOfWeek: {
      type: [String],
      validate: {
        validator: function (v) {
          const validDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
          return v.every((day) => validDays.includes(day));
        },
        message: (props) => `${props.value} contains invalid day codes!`,
      },
    },
  },
  { _id: false }
);

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
  allDay: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
  },
  recurrence: {
    type: recurrenceSchema,
  },
  color: {
    type: String,
  },
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;
