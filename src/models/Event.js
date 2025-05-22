import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({

  ownerName: {type: String, required: true},
  ownerEmail: {type: String, required: true},
  title: {type: String, required: true},
  courseCode: {type: String, required: true},
  weight: {type: Number, required: true},
  dueDate: {type: Date, required: true},
  description: {type: String, required: true},
  type: {type: String, required: true},
  // Automatically set on Event Creation. User Sets Completed and Grade later
  isCompleted: {type: Boolean, default: false},
  grade: {type: String, default: "0"},
})

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);


export default Event;