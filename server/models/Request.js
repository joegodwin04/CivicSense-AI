const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a request title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a request description']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      },
      address: {
        type: String,
        default: ''
      }
    },
    status: {
      type: String,
      enum: ['processing', 'pending', 'under-review', 'resolved'],
      default: 'processing'
    },
    category: {
      type: String,
      default: 'other'
    },
    sentiment: {
      type: String,
      default: 'neutral'
    },
    urgencyScore: {
      type: Number,
      default: 1
    },
    priorityScore: {
      type: Number,
      default: 0
    },
    aiRecommendation: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: null
    },
    audioTranscript: {
      type: String,
      default: null
    },
    inputMethod: {
      type: String,
      enum: ['text', 'voice', 'image'],
      default: 'text'
    },
    duplicateCount: {
      type: Number,
      default: 0
    },
    nearbyInfrastructure: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

// Add geospatial 2dsphere index for location
requestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);

