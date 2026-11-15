const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    topicName: {
      type: String,
      required: true,
      trim: true,
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    // Theory section
    theoryMatter: {
      type: String,
      default: "",
    },
    theoryMatterExplanation: {
      type: String,
      default: "",
    },

    // Mind map section
    mindMap: {
      type: String,
      default: "",
    },
    mindMapExplanation: {
      type: String,
      default: "",
    },

    // Example problems section
    exampleProblemsWithSolution: {
      type: String,
      default: "",
    },
    exampleProblemsExplanation: {
      type: String,
      default: "",
    },

    // Questions section
    questions: {
      type: String,
      default: "",
    },
    questionsExplanation: {
      type: String,
      default: "",
    },

    // Solution section
    solution: {
      type: String,
      default: "",
    },
    solutionExplanation: {
      type: String,
      default: "",
    },

    // Related theory section
    relatedTheory: {
      type: String,
      default: "",
    },
    relatedTheoryExplanation: {
      type: String,
      default: "",
    },

    // Equation fields
    theoryEquation: {
      type: String,
      default: "",
    },
    explanationEquation: {
      type: String,
      default: "",
    },
    exampleEquation: {
      type: String,
      default: "",
    },
    questionEquation: {
      type: String,
      default: "",
    },
    solutionEquation: {
      type: String,
      default: "",
    },
    relatedTheoryEquation: {
      type: String,
      default: "",
    },

    // Documents
    theoryDocuments: {
      type: [String],
      default: [],
    },
    problemDocuments: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);