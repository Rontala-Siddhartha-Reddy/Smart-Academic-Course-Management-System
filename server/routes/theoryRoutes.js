const express = require("express");
const Theory = require("../models/Theory");

const router = express.Router();

// Get theory by topicId
router.get("/:topicId", async (req, res) => {
  try {
    const theory = await Theory.findOne({
      topicId: req.params.topicId,
    });

    res.status(200).json(theory);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching theory",
      error: error.message,
    });
  }
});

// Add or update theory
router.post("/", async (req, res) => {
  try {
    const { topicId } = req.body;

    if (!topicId) {
      return res.status(400).json({
        message: "topicId is required",
      });
    }

    const theory = await Theory.findOneAndUpdate(
      { topicId },
      req.body,
      { new: true, upsert: true }
    );

    res.status(201).json(theory);
  } catch (error) {
    res.status(500).json({
      message: "Error saving theory",
      error: error.message,
    });
  }
});

// Update theory by theory id
router.put("/:id", async (req, res) => {
  try {
    const updatedTheory = await Theory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedTheory) {
      return res.status(404).json({
        message: "Theory not found",
      });
    }

    res.status(200).json(updatedTheory);
  } catch (error) {
    res.status(500).json({
      message: "Error updating theory",
      error: error.message,
    });
  }
});

// Delete theory
router.delete("/:id", async (req, res) => {
  try {
    const deletedTheory = await Theory.findByIdAndDelete(req.params.id);

    if (!deletedTheory) {
      return res.status(404).json({
        message: "Theory not found",
      });
    }

    res.status(200).json({
      message: "Theory deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting theory",
      error: error.message,
    });
  }
});

module.exports = router;