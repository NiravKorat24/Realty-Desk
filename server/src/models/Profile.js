const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, trim: true },
    projectName: { type: String, required: true, trim: true },
    buildingId: { type: String, required: true, trim: true },
    buildingName: { type: String, required: true, trim: true },
    floorNumber: { type: Number, required: true },
    floorLabel: { type: String, required: true, trim: true },
    unitNumber: { type: String, required: true, trim: true },
    buyerName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    notes: { type: String, trim: true },
    alternateMobile: { type: String, trim: true },
    address: { type: String, trim: true },
    governmentId: { type: String, trim: true },
    aadhaarNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },
    budget: { type: String, trim: true },
    source: { type: String, trim: true },
    status: {
      type: String,
      trim: true,
      default: "booked"
    },
    documents: {
      type: [documentSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Profile", profileSchema);
