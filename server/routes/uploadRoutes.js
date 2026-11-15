const express = require("express");
const mongoose = require("mongoose");
const Upload = require("../models/Upload");

const router = express.Router();

// Add one upload
router.post("/", async (req, res) => {
  try {
    const { topicId, documentType, name, mimeType, size, fileData } = req.body;

    if (!topicId || !documentType || !name || !fileData) {
      return res.status(400).json({
        message: "topicId, documentType, name, and fileData are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        message: "Invalid topicId",
      });
    }

    const upload = await Upload.create({
      topicId,
      documentType,
      name,
      mimeType: mimeType || "",
      size: size || 0,
      fileData,
    });

    res.status(201).json({
      id: upload._id,
      _id: upload._id,
      topicId: upload.topicId,
      documentType: upload.documentType,
      name: upload.name,
      type: upload.mimeType,
      mimeType: upload.mimeType,
      size: upload.size,
      data: upload.fileData,
      fileData: upload.fileData,
      createdAt: upload.createdAt,
    });
  } catch (error) {
    console.error("Upload save error:", error);

    res.status(500).json({
      message: "Error saving upload",
      error: error.message,
    });
  }
});

// Add multiple uploads
router.post("/bulk", async (req, res) => {
  try {
    const { topicId, documentType, documents } = req.body;

    if (!topicId || !documentType || !Array.isArray(documents)) {
      return res.status(400).json({
        message: "topicId, documentType, and documents array are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        message: "Invalid topicId",
      });
    }

    const validDocuments = documents.filter((doc) => doc?.data || doc?.fileData);

    const uploadDocs = validDocuments.map((doc) => ({
      topicId,
      documentType,
      name: doc.name || "Uploaded Document",
      mimeType: doc.type || doc.mimeType || "",
      size: doc.size || 0,
      fileData: doc.data || doc.fileData,
    }));

    if (uploadDocs.length === 0) {
      return res.status(200).json([]);
    }

    const savedUploads = await Upload.insertMany(uploadDocs);

    const converted = savedUploads.map((upload) => ({
      id: upload._id,
      _id: upload._id,
      topicId: upload.topicId,
      documentType: upload.documentType,
      name: upload.name,
      type: upload.mimeType,
      mimeType: upload.mimeType,
      size: upload.size,
      data: upload.fileData,
      fileData: upload.fileData,
      createdAt: upload.createdAt,
    }));

    res.status(201).json(converted);
  } catch (error) {
    console.error("Bulk upload save error:", error);

    res.status(500).json({
      message: "Error saving uploads",
      error: error.message,
    });
  }
});

// Get uploads by topic
router.get("/topic/:topicId", async (req, res) => {
  try {
    const { topicId } = req.params;
    const { documentType } = req.query;

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        message: "Invalid topicId",
      });
    }

    const filter = { topicId };

    if (documentType) {
      filter.documentType = documentType;
    }

    const uploads = await Upload.find(filter).sort({ createdAt: -1 });

    const converted = uploads.map((upload) => ({
      id: upload._id,
      _id: upload._id,
      topicId: upload.topicId,
      documentType: upload.documentType,
      name: upload.name,
      type: upload.mimeType,
      mimeType: upload.mimeType,
      size: upload.size,
      data: upload.fileData,
      fileData: upload.fileData,
      createdAt: upload.createdAt,
    }));

    res.status(200).json(converted);
  } catch (error) {
    console.error("Upload fetch error:", error);

    res.status(500).json({
      message: "Error fetching uploads",
      error: error.message,
    });
  }
});

// Delete one upload
router.delete("/:id", async (req, res) => {
  try {
    const deletedUpload = await Upload.findByIdAndDelete(req.params.id);

    if (!deletedUpload) {
      return res.status(404).json({
        message: "Upload not found",
      });
    }

    res.status(200).json({
      message: "Upload deleted successfully",
    });
  } catch (error) {
    console.error("Upload delete error:", error);

    res.status(500).json({
      message: "Error deleting upload",
      error: error.message,
    });
  }
});

// Delete all uploads of a topic
router.delete("/topic/:topicId", async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({
        message: "Invalid topicId",
      });
    }

    await Upload.deleteMany({ topicId });

    res.status(200).json({
      message: "All topic uploads deleted successfully",
    });
  } catch (error) {
    console.error("Topic uploads delete error:", error);

    res.status(500).json({
      message: "Error deleting topic uploads",
      error: error.message,
    });
  }
});

module.exports = router;