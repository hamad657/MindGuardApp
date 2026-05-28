const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, default: "Unknown" },
  active: { type: Boolean, default: true } // Jo quote abhi dikhana ho usay active rakhne ke liye
}, { timestamps: true });

module.exports = mongoose.model('Quote', QuoteSchema);