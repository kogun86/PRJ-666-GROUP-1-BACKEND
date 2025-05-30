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
    type: [],
    default: [],
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
