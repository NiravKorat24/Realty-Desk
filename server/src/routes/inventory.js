const express = require("express");
const Inventory = require("../models/Inventory");

const router = express.Router();

const asyncHandler = (handler) => (request, response, next) =>
  Promise.resolve(handler(request, response, next)).catch(next);

// GET /api/inventory
router.get(
  "/",
  asyncHandler(async (_request, response) => {
    const inventory = await Inventory.findOne().sort({ updatedAt: -1 });
    if (!inventory) {
      return response.json([]);
    }
    response.json(inventory.projects);
  })
);

// POST /api/inventory
router.post(
  "/",
  asyncHandler(async (request, response) => {
    const { projects } = request.body;

    if (!Array.isArray(projects)) {
      return response.status(400).json({ message: "Invalid projects data" });
    }

    let inventory = await Inventory.findOne().sort({ updatedAt: -1 });
    if (inventory) {
      inventory.projects = projects;
      await inventory.save();
    } else {
      inventory = await Inventory.create({ projects });
    }

    response.status(200).json(inventory.projects);
  })
);

module.exports = router;
