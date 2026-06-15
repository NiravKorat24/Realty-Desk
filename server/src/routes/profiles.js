const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Profile = require("../models/Profile");

const router = express.Router();
const uploadsDirectory = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadsDirectory);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname);
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 60);

    callback(null, `${Date.now()}-${safeBaseName || "document"}${extension}`);
  }
});

const upload = multer({ storage });

const asyncHandler = (handler) => (request, response, next) =>
  Promise.resolve(handler(request, response, next)).catch(next);

router.get(
  "/",
  asyncHandler(async (_request, response) => {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    response.json(profiles);
  })
);

router.get(
  "/:id",
  asyncHandler(async (request, response) => {
    const profile = await Profile.findById(request.params.id);

    if (!profile) {
      return response.status(404).json({ message: "Profile not found" });
    }

    response.json(profile);
  })
);

router.post(
  "/",
  asyncHandler(async (request, response) => {
    const profile = await Profile.create(request.body);
    response.status(201).json(profile);
  })
);

router.patch(
  "/:id/details",
  asyncHandler(async (request, response) => {
    const allowedFields = [
      "alternateMobile",
      "address",
      "governmentId",
      "aadhaarNumber",
      "panNumber",
      "budget",
      "source",
      "notes",
      "status"
    ];

    const updates = Object.fromEntries(
      Object.entries(request.body).filter(([key]) => allowedFields.includes(key))
    );

    const profile = await Profile.findByIdAndUpdate(request.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!profile) {
      return response.status(404).json({ message: "Profile not found" });
    }

    response.json(profile);
  })
);

router.post(
  "/:id/documents",
  asyncHandler(async (request, response) => {
    const { title, type, url, notes } = request.body;

    if (!title || !title.trim()) {
      return response.status(400).json({ message: "Document title is required" });
    }

    const profile = await Profile.findById(request.params.id);

    if (!profile) {
      return response.status(404).json({ message: "Profile not found" });
    }

    profile.documents.push({
      title: title.trim(),
      type: type?.trim(),
      url: url?.trim(),
      notes: notes?.trim()
    });

    await profile.save();
    response.status(201).json(profile);
  })
);

router.post(
  "/:id/documents/upload",
  upload.single("document"),
  asyncHandler(async (request, response) => {
    if (!request.file) {
      return response.status(400).json({ message: "Document file is required" });
    }

    const profile = await Profile.findById(request.params.id);

    if (!profile) {
      fs.unlink(request.file.path, () => {});
      return response.status(404).json({ message: "Profile not found" });
    }

    profile.documents.push({
      title: request.body.title?.trim() || request.file.originalname,
      type: request.body.type?.trim() || request.file.mimetype,
      url: `/uploads/${request.file.filename}`,
      notes: request.body.notes?.trim()
    });

    await profile.save();
    response.status(201).json(profile);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    const profile = await Profile.findById(request.params.id);

    if (!profile) {
      return response.status(404).json({ message: "Profile not found" });
    }

    profile.documents.forEach((document) => {
      if (document.url?.startsWith("/uploads/")) {
        const filePath = path.join(uploadsDirectory, path.basename(document.url));
        fs.unlink(filePath, () => {});
      }
    });

    await Profile.findByIdAndDelete(request.params.id);
    response.status(204).send();
  })
);

module.exports = router;
