require("dotenv").config();

const cors = require("cors");
const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const profileRoutes = require("./routes/profiles");
const inventoryRoutes = require("./routes/inventory");

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI;
const uploadsDirectory = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDirectory));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/profiles", profileRoutes);
app.use("/api/inventory", inventoryRoutes);

app.use((error, _request, response, _next) => {
  if (error.name === "ValidationError") {
    return response.status(400).json({ message: error.message });
  }

  if (error.name === "CastError") {
    return response.status(400).json({ message: "Invalid id" });
  }

  response.status(500).json({ message: "Server error" });
});

const startDb = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in environment variables.");
  }
  await mongoose.connect(mongoUri);
};

// Connect to database on every request to support serverless environment
app.use(async (_req, _res, next) => {
  try {
    await startDb();
    next();
  } catch (error) {
    next(error);
  }
});

// Run local server if not deployed as a Vercel serverless function
if (!process.env.VERCEL) {
  startDb()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Startup failed", error);
      process.exit(1);
    });
}

module.exports = app;
