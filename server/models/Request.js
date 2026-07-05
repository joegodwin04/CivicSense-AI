const mongoose = require('mongoose');

// TODO: Extend the Request model schema to match production needs.
// This schema represents development requests and complaints filed by citizens.

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
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['processing', 'pending', 'under-review', 'resolved'],
      default: 'processing'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
