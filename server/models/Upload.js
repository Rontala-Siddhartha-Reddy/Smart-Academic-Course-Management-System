const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },

    documentType: {
      type: String,
      enum: ["theory", "problem"],
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      default: "",
    },

    size: {
      type: Number,
      default: 0,
    },

    fileData: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Upload", uploadSchema);