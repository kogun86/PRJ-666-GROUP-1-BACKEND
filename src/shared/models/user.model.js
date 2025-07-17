import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  avatarURL: {
    type: String,
    // TODO: Rework with image storage
    default: 'https://i.insider.com/602ee9ced3ad27001837f2ac?width=700',
    required: true,
  },
  habits: {
    type: {
      procrastinationIndex: { type: Number, default: 0 }, // 0-100 scale, lower is better
      consistencyIndex: { type: Number, default: 100 }, // 0-100; higher is better
      gradeStabilityIndex: { type: Number, default: 100 }, // 0-100; higher is better
      completionEfficiencyIndex: { type: Number, default: 100 }, // 0-100; higher is better
    },
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
