const express = require("express");
const Topic = require("../models/Topic");

const router = express.Router();



// Get single topic by topicId
router.get("/single/:id", async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching topic",
      error: error.message,
    });
  }
});

// Get topics by chapterId
router.get("/:chapterId", async (req, res) => {
  try {
    const topics = await Topic.find({
      chapterId: req.params.chapterId,
    }).sort({ createdAt: -1 });

    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching topics",
      error: error.message,
    });
  }
});

// Add new topic
router.post("/", async (req, res) => {
  try {
    const {
      topicName,
      chapterId,

      theoryMatter,
      theoryMatterExplanation,

      mindMap,
      mindMapExplanation,

      exampleProblemsWithSolution,
      exampleProblemsExplanation,

      questions,
      questionsExplanation,

      solution,
      solutionExplanation,

      relatedTheory,
      relatedTheoryExplanation,

      theoryEquation,
      explanationEquation,
      exampleEquation,
      questionEquation,
      solutionEquation,
      relatedTheoryEquation,

      theoryDocuments,
      problemDocuments,
    } = req.body;

    if (!topicName || !chapterId) {
      return res.status(400).json({
        message: "topicName and chapterId are required",
      });
    }

    const topic = await Topic.create({
      topicName,
      chapterId,

      theoryMatter: theoryMatter || "",
      theoryMatterExplanation: theoryMatterExplanation || "",

      mindMap: mindMap || "",
      mindMapExplanation: mindMapExplanation || "",

      exampleProblemsWithSolution: exampleProblemsWithSolution || "",
      exampleProblemsExplanation: exampleProblemsExplanation || "",

      questions: questions || "",
      questionsExplanation: questionsExplanation || "",

      solution: solution || "",
      solutionExplanation: solutionExplanation || "",

      relatedTheory: relatedTheory || "",
      relatedTheoryExplanation: relatedTheoryExplanation || "",

      theoryEquation: theoryEquation || "",
      explanationEquation: explanationEquation || "",
      exampleEquation: exampleEquation || "",
      questionEquation: questionEquation || "",
      solutionEquation: solutionEquation || "",
      relatedTheoryEquation: relatedTheoryEquation || "",

      theoryDocuments: theoryDocuments || [],
      problemDocuments: problemDocuments || [],
    });

    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({
      message: "Error adding topic",
      error: error.message,
    });
  }
});

// Update topic
router.put("/:id", async (req, res) => {
  try {
    const {
      topicName,

      theoryMatter,
      theoryMatterExplanation,

      mindMap,
      mindMapExplanation,

      exampleProblemsWithSolution,
      exampleProblemsExplanation,

      questions,
      questionsExplanation,

      solution,
      solutionExplanation,

      relatedTheory,
      relatedTheoryExplanation,

      theoryEquation,
      explanationEquation,
      exampleEquation,
      questionEquation,
      solutionEquation,
      relatedTheoryEquation,

      theoryDocuments,
      problemDocuments,
    } = req.body;

    const updatedTopic = await Topic.findByIdAndUpdate(
      req.params.id,
      {
        ...(topicName !== undefined && { topicName }),

        ...(theoryMatter !== undefined && { theoryMatter }),
        ...(theoryMatterExplanation !== undefined && {
          theoryMatterExplanation,
        }),

        ...(mindMap !== undefined && { mindMap }),
        ...(mindMapExplanation !== undefined && { mindMapExplanation }),

        ...(exampleProblemsWithSolution !== undefined && {
          exampleProblemsWithSolution,
        }),
        ...(exampleProblemsExplanation !== undefined && {
          exampleProblemsExplanation,
        }),

        ...(questions !== undefined && { questions }),
        ...(questionsExplanation !== undefined && {
          questionsExplanation,
        }),

        ...(solution !== undefined && { solution }),
        ...(solutionExplanation !== undefined && {
          solutionExplanation,
        }),

        ...(relatedTheory !== undefined && { relatedTheory }),
        ...(relatedTheoryExplanation !== undefined && {
          relatedTheoryExplanation,
        }),

        ...(theoryEquation !== undefined && { theoryEquation }),
        ...(explanationEquation !== undefined && { explanationEquation }),
        ...(exampleEquation !== undefined && { exampleEquation }),
        ...(questionEquation !== undefined && { questionEquation }),
        ...(solutionEquation !== undefined && { solutionEquation }),
        ...(relatedTheoryEquation !== undefined && {
          relatedTheoryEquation,
        }),

        ...(theoryDocuments !== undefined && { theoryDocuments }),
        ...(problemDocuments !== undefined && { problemDocuments }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedTopic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    res.status(200).json(updatedTopic);
  } catch (error) {
    res.status(500).json({
      message: "Error updating topic",
      error: error.message,
    });
  }
});

// Delete topic
router.delete("/:id", async (req, res) => {
  try {
    const deletedTopic = await Topic.findByIdAndDelete(req.params.id);

    if (!deletedTopic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    res.status(200).json({
      message: "Topic deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting topic",
      error: error.message,
    });
  }
});

module.exports = router;