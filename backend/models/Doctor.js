const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'General Psychiatrist',
        'Anxiety Specialist',
        'Depression Specialist',
        'Trauma Specialist',
        'Child Psychologist',
      ],
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female'],
    },
    qualification: {
      type: String,
      default: '', 
    },
    experience: {
      type: Number,
      default: 0, 
    },
    city: {
      type: String,
      default: '', 
    },
    availability: {
      type: String,
      default: 'Available', 
    },
    isFirstInCategory: {
      type: Boolean,
      default: false, 
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);