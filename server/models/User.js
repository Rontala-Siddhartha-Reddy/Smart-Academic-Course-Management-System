const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    canAddCourse: { type: Boolean, default: false },
    canEditCourse: { type: Boolean, default: false },
    canDeleteCourse: { type: Boolean, default: false },
    canImportCourse: { type: Boolean, default: false },

    canAddSubject: { type: Boolean, default: false },
    canEditSubject: { type: Boolean, default: false },
    canDeleteSubject: { type: Boolean, default: false },
    canImportSubject: { type: Boolean, default: false },

    canAddChapter: { type: Boolean, default: false },
    canEditChapter: { type: Boolean, default: false },
    canDeleteChapter: { type: Boolean, default: false },
    canImportChapter: { type: Boolean, default: false },

    canAddTopic: { type: Boolean, default: false },
    canEditTopic: { type: Boolean, default: false },
    canDeleteTopic: { type: Boolean, default: false },
    canImportTopic: { type: Boolean, default: false },

    canAddStudent: { type: Boolean, default: false },
    canRemoveStudent: { type: Boolean, default: false },
    canViewUsers: { type: Boolean, default: false },

    canViewCourse: { type: Boolean, default: true },
    canViewTopic: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "subadmin", "teacher", "student"],
      required: true,
      default: "student",
    },

    permissions: {
      type: permissionSchema,
      default: {},
    },

    assignedCourses: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);