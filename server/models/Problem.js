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

const problemSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },

    questions: {
      type: String,
      default: "",
    },

    solution: {
      type: String,
      default: "",
    },

    relatedTheory: {
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

    problemDocuments: [documentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", problemSchema);