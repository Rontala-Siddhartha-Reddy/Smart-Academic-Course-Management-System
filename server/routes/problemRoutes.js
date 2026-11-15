const express = require("express");
const Problem = require("../models/Problem");

const router = express.Router();

// Get problem by topicId
router.get("/:topicId", async (req, res) => {
  try {
    const problem = await Problem.findOne({
      topicId: req.params.topicId,
    });

    res.status(200).json(problem);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching problem",
      error: error.message,
    });
  }
});

// Add or update problem
router.post("/", async (req, res) => {
  try {
    const { topicId } = req.body;

    if (!topicId) {
      return res.status(400).json({
        message: "topicId is required",
      });
    }

    const problem = await Problem.findOneAndUpdate(
      { topicId },
      req.body,
      { new: true, upsert: true }
    );

    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({
      message: "Error saving problem",
      error: error.message,
    });
  }
});

// Update problem by problem id
router.put("/:id", async (req, res) => {
  try {
    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProblem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    res.status(200).json(updatedProblem);
  } catch (error) {
    res.status(500).json({
      message: "Error updating problem",
      error: error.message,
    });
  }
});

// Delete problem
router.delete("/:id", async (req, res) => {
  try {
    const deletedProblem = await Problem.findByIdAndDelete(req.params.id);

    if (!deletedProblem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    res.status(200).json({
      message: "Problem deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting problem",
      error: error.message,
    });
  }
});

module.exports = router;