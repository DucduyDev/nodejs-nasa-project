const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },

  launchDate: {
    type: Date,
    required: true,
  },

  mission: {
    type: String,
    required: true,
  },

  rocket: {
    type: String,
    required: true,
  },

  target: {
    type: String,
  },

  customers: {
    type: [String],
    default: ["Zero to Mastery", "NASA"],
  },

  upcoming: {
    type: Boolean,
    default: true,
  },

  success: {
    type: Boolean,
    default: true,
  },
});

// Connects schema with "launches" collection
module.exports = mongoose.model("Launch", launchesSchema);
