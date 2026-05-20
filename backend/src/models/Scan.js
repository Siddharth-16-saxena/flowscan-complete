const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    profile: {
      goal: String,
      allergies: [String],
      diet: String,
      condition: String,
    },
    healthScore: Number,
    riskLevel: String,
    warnings: [String],
    recommendation: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scan', ScanSchema);
