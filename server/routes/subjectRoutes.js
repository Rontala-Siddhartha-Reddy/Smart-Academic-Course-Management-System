const express = require("express");
const Subject = require("../models/Subject");

const router = express.Router();

// Get subjects by courseId
router.get("/:courseId", async (req, res) => {
  try {
    const subjects = await Subject.find({
      courseId: req.params.courseId,
    }).sort({ createdAt: -1 });

    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching subjects",
      error: error.message,
    });
  }
});

// Add new subject
router.post("/", async (req, res) => {
  try {
    const { subjectName, courseId } = req.body;

    if (!subjectName || !courseId) {
      return res.status(400).json({
        message: "subjectName and courseId are required",
      });
    }

    const subject = await Subject.create({
      subjectName,
      courseId,
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({
      message: "Error adding subject",
      error: error.message,
    });
  }
});

// Update subject
router.put("/:id", async (req, res) => {
  try {
    const { subjectName } = req.body;

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      { subjectName },
      { new: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(500).json({
      message: "Error updating subject",
      error: error.message,
    });
  }
});

// Delete subject
router.delete("/:id", async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

    if (!deletedSubject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting subject",
      error: error.message,
    });
  }
});

module.exports = router;