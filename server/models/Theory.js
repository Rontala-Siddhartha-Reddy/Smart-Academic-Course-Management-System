const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      default: "",
    },

    data: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const theorySchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },

    theoryMatter: {
      type: String,
      default: "",
    },

    explanation: {
      type: String,
      default: "",
    },

    exampleProblemsWithSolution: {
      type: String,
      default: "",
    },

    mindMap: {
      type: String,
      default: "",
    },

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

    theoryDocuments: [documentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theory", theorySchema);