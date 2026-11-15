const express = require("express");
const User = require("../models/User");

const router = express.Router();

const getDefaultPermissions = (role) => {
  if (role === "admin" || role === "subadmin") {
    return {
      canAddCourse: true,
      canEditCourse: true,
      canDeleteCourse: true,
      canImportCourse: true,

      canAddSubject: true,
      canEditSubject: true,
      canDeleteSubject: true,
      canImportSubject: true,

      canAddChapter: true,
      canEditChapter: true,
      canDeleteChapter: true,
      canImportChapter: true,

      canAddTopic: true,
      canEditTopic: true,
      canDeleteTopic: true,
      canImportTopic: true,

      canAddStudent: true,
      canRemoveStudent: true,
      canViewUsers: true,

      canViewCourse: true,
      canViewTopic: true,
    };
  }

  if (role === "teacher") {
    return {
      canAddCourse: false,
      canEditCourse: false,
      canDeleteCourse: false,
      canImportCourse: false,

      canAddSubject: true,
      canEditSubject: true,
      canDeleteSubject: false,
      canImportSubject: true,

      canAddChapter: true,
      canEditChapter: true,
      canDeleteChapter: false,
      canImportChapter: true,

      canAddTopic: true,
      canEditTopic: true,
      canDeleteTopic: false,
      canImportTopic: true,

      canAddStudent: false,
      canRemoveStudent: false,
      canViewUsers: false,

      canViewCourse: true,
      canViewTopic: true,
    };
  }

  return {
    canAddCourse: false,
    canEditCourse: false,
    canDeleteCourse: false,
    canImportCourse: false,

    canAddSubject: false,
    canEditSubject: false,
    canDeleteSubject: false,
    canImportSubject: false,

    canAddChapter: false,
    canEditChapter: false,
    canDeleteChapter: false,
    canImportChapter: false,

    canAddTopic: false,
    canEditTopic: false,
    canDeleteTopic: false,
    canImportTopic: false,

    canAddStudent: false,
    canRemoveStudent: false,
    canViewUsers: false,

    canViewCourse: true,
    canViewTopic: true,
  };
};

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE user
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role, permissions, assignedCourses } =
      req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email.",
      });
    }

    const defaultPermissions = getDefaultPermissions(role);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password.trim(),
      role,
      assignedCourses: assignedCourses || [],
      permissions: {
        ...defaultPermissions,
        ...(permissions || {}),
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      password: password.trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE user
router.put("/:id", async (req, res) => {
  try {
    const { name, email, password, role, permissions, assignedCourses } =
      req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (password !== undefined) updateData.password = password.trim();
    if (role !== undefined) updateData.role = role;
    if (assignedCourses !== undefined) updateData.assignedCourses = assignedCourses;

    if (permissions !== undefined) {
      const selectedRole = role || undefined;

      if (selectedRole === "admin" || selectedRole === "subadmin") {
        updateData.permissions = getDefaultPermissions(selectedRole);
      } else {
        updateData.permissions = permissions;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message: "Admin user cannot be deleted.",
      });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully.",
      deletedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SEED default users
router.post("/seed", async (req, res) => {
  try {
    const existingCount = await User.countDocuments();

    if (existingCount > 0) {
      return res.json({
        message: "Users already exist. Seed skipped.",
      });
    }

    const defaultUsers = [
      {
        name: "Admin",
        email: "admin@gmail.com",
        password: "admin123",
        role: "admin",
        assignedCourses: [],
        permissions: getDefaultPermissions("admin"),
      },
      {
        name: "Sub Admin",
        email: "subadmin@gmail.com",
        password: "subadmin123",
        role: "subadmin",
        assignedCourses: [],
        permissions: getDefaultPermissions("subadmin"),
      },
      {
        name: "Teacher",
        email: "teacher@gmail.com",
        password: "teacher123",
        role: "teacher",
        assignedCourses: [],
        permissions: getDefaultPermissions("teacher"),
      },
      {
        name: "Student",
        email: "student@gmail.com",
        password: "student123",
        role: "student",
        assignedCourses: [],
        permissions: getDefaultPermissions("student"),
      },
    ];

    const users = await User.insertMany(defaultUsers);

    res.status(201).json({
      message: "Default users created successfully.",
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;