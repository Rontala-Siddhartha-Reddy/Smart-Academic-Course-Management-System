const express = require("express");
const Chapter = require("../models/Chapter");

const router = express.Router();

// Get chapters by subjectId
router.get("/:subjectId", async (req, res) => {
  try {
    const chapters = await Chapter.find({
      subjectId: req.params.subjectId,
    }).sort({ createdAt: -1 });

    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching chapters",
      error: error.message,
    });
  }
});

// Add new chapter
router.post("/", async (req, res) => {
  try {
    const { chapterName, subjectId } = req.body;

    if (!chapterName || !subjectId) {
      return res.status(400).json({
        message: "chapterName and subjectId are required",
      });
    }

    const chapter = await Chapter.create({
      chapterName,
      subjectId,
    });

    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({
      message: "Error adding chapter",
      error: error.message,
    });
  }
});

// Update chapter
router.put("/:id", async (req, res) => {
  try {
    const { chapterName } = req.body;

    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { chapterName },
      { new: true }
    );

    if (!updatedChapter) {
      return res.status(404).json({
        message: "Chapter not found",
      });
    }

    res.status(200).json(updatedChapter);
  } catch (error) {
    res.status(500).json({
      message: "Error updating chapter",
      error: error.message,
    });
  }
});

// Delete chapter
router.delete("/:id", async (req, res) => {
  try {
    const deletedChapter = await Chapter.findByIdAndDelete(req.params.id);

    if (!deletedChapter) {
      return res.status(404).json({
        message: "Chapter not found",
      });
    }

    res.status(200).json({
      message: "Chapter deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting chapter",
      error: error.message,
    });
  }
});

module.exports = router;