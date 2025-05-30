import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  section: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  instructor: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: /.+@.+\..+/,
    },
    availableTimeSlots: {
      type: [
        {
          weekday: {
            type: Number,
            required: true,
          },
          startTime: {
            type: Number,
            required: true,
          },
          endTime: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  },
  schedule: [
    {
      classType: {
        type: String,
        required: true,
        enum: ['lecture', 'lab'],
      },
      weekday: {
        type: Number,
        required: true,
      },
      startTime: {
        type: Number,
        required: true,
      },
      endTime: {
        type: Number,
        required: true,
      },
      location: {
        type: String,
      },
    },
  ],
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Course;
