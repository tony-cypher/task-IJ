const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const task = mongoose.model('Task', taskSchema);
module.exports = task

