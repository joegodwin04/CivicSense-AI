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
      },
      landmark: {
        type: String,
        default: ''
      },
      locality: {
        type: String,
        default: ''
      },
      ward: {
        type: String,
        default: ''
      },
      city: {
        type: String,
        default: ''
      },
      district: {
        type: String,
        default: ''
      },
      state: {
        type: String,
        default: ''
      },
      postalCode: {
        type: String,
        default: ''
      }
    },
    status: {
      type: String,
      enum: ['processing', 'pending', 'under-review', 'resolved', 'rejected'],
      default: 'pending'
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
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isDuplicate: {
      type: Boolean,
      default: false
    },
    parentRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      default: null
    },
    aiImpactEstimate: {
      type: String,
      default: ''
    },
    suggestedSchemes: {
      type: [String],
      default: []
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' }
      }
    ]
  },
  { timestamps: true }
);

// Add geospatial 2dsphere index for location
requestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);

