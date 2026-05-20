const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Untitled Workflow',
  },
  original_filename: {
    type: String,
    required: true,
  },
  file_type: {
    type: String,
    enum: ['csv', 'json'],
    required: true,
  },
  uploaded_at: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'analyzed', 'error'],
    default: 'pending',
  },
  task_count: {
    type: Number,
    default: 0,
  },
  tags: [String],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

WorkflowSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'workflow_id',
});

WorkflowSchema.virtual('analysis', {
  ref: 'Analysis',
  localField: '_id',
  foreignField: 'workflow_id',
  justOne: true,
});

module.exports = mongoose.model('Workflow', WorkflowSchema);
