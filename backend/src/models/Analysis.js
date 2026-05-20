const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  workflow_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    unique: true,
    index: true,
  },
  metrics: {
    total_tasks: { type: Number, default: 0 },
    bottleneck_count: { type: Number, default: 0 },
    avg_duration_minutes: { type: Number, default: 0 },
    max_duration_minutes: { type: Number, default: 0 },
    min_duration_minutes: { type: Number, default: 0 },
    total_duration_minutes: { type: Number, default: 0 },
    total_idle_minutes: { type: Number, default: 0 },
    efficiency_score: { type: Number, default: 100 },
  },
  bottlenecks: [String],
  idle_info: [String],
  suggestions: [String],
  analyzed_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
