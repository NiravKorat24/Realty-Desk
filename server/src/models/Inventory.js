const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    projects: {
      type: Array,
      required: true,
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);
