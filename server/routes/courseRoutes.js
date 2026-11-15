const express = require("express");
const Course = require("../models/Course");

const router = express.Router();

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching courses",
      error: error.message,
    });
  }
});

// Add new course
router.post("/", async (req, res) => {
  try {
    const { courseName } = req.body;

    if (!courseName) {
      return res.status(400).json({
        message: "courseName is required",
      });
    }

    const course = await Course.create({
      courseName,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({
      message: "Error adding course",
      error: error.message,
    });
  }
});

// Update course
router.put("/:id", async (req, res) => {
  try {
    const { courseName } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { courseName },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({
      message: "Error updating course",
      error: error.message,
    });
  }
});

// Delete course
router.delete("/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting course",
      error: error.message,
    });
  }
});

module.exports = router;