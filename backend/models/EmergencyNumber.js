const mongoose = require('mongoose');

const emergencyNumberSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      // e.g., "Medical Emergency", "Mental Health Crisis", "Suicide Prevention"
    },
    number: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    availability: {
      type: String,
      default: '24/7', // "24/7", "Business Hours", etc.
    },
    country: {
      type: String,
      default: 'Pakistan',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyNumber', emergencyNumberSchema);
