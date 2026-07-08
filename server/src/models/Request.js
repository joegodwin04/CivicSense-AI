const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: null },
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // allow anonymous/public submissions
    },

    // --- AI-populated fields (filled in asynchronously by aiService) ---
    translatedText: { type: String, default: null },
    category: {
      type: String,
      enum: ['Roads', 'Water', 'Power', 'Healthcare', 'Education', 'Sanitation', 'Other'],
      default: 'Other',
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'angry'],
      default: 'neutral',
    },
    urgencyScore: { type: Number, min: 1, max: 10, default: null },
    priorityScore: { type: Number, min: 1, max: 100, default: null },
    aiRecommendation: { type: String, default: null },

    status: {
      type: String,
      enum: ['processing', 'analyzed', 'in_progress', 'resolved', 'rejected'],
      default: 'processing',
    },
  },
  { timestamps: true }
);

// Helpful indexes for the dashboard's aggregation/sorting queries
requestSchema.index({ category: 1 });
requestSchema.index({ priorityScore: -1 });
requestSchema.index({ status: 1 });

module.exports = mongoose.model('Request', requestSchema);
