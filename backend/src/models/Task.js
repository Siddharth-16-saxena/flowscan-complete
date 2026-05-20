const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  workflow_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    index: true,
  },
  task_name: {
    type: String,
    required: true,
    trim: true,
  },
  start_time: {
    type: String,
    required: true,
  },
  end_time: {
    type: String,
    required: true,
  },
  assigned_to: {
    type: String,
    required: true,
    trim: true,
  },
  duration_minutes: {
    type: Number,
    default: 0,
  },
  is_bottleneck: {
    type: Boolean,
    default: false,
  },
  has_idle_before: {
    type: Boolean,
    default: false,
  },
  idle_gap_minutes: {
    type: Number,
    default: 0,
  },
  sequence_order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

TaskSchema.index({ workflow_id: 1, sequence_order: 1 });

module.exports = mongoose.model('Task', TaskSchema);
