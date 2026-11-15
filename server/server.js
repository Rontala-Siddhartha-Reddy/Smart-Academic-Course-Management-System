const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// This is used to serve generated TTS audio files
app.use("/tts-audio", express.static(path.join(__dirname, "tts-audio")));

// Routes
const courseRoutes = require("./routes/courseRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const topicRoutes = require("./routes/topicRoutes");
const theoryRoutes = require("./routes/theoryRoutes");
const problemRoutes = require("./routes/problemRoutes");
const userRoutes = require("./routes/userRoutes");
const translateRoutes = require("./routes/translateRoutes");
const ttsRoutes = require("./routes/ttsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/theory", theoryRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/translate", translateRoutes);
app.use("/api/tts", ttsRoutes);
app.use("/api/uploads", uploadRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Course Dashboard Server Running");
});

app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Course Dashboard API Running",
    routes: {
      courses: "/api/courses",
      subjects: "/api/subjects/:courseId",
      chapters: "/api/chapters/:subjectId",
      topicsByChapter: "/api/topics/:chapterId",
      singleTopic: "/api/topics/single/:id",
      users: "/api/users",
      translate: "/api/translate",
      tts: "/api/tts",
      ttsAudioFiles: "/tts-audio/filename.mp3",
      uploads: "/api/uploads",
      uploadOne: "POST /api/uploads",
      uploadBulk: "POST /api/uploads/bulk",
      uploadsByTopic: "GET /api/uploads/topic/:topicId",
      deleteUpload: "DELETE /api/uploads/:id",
      deleteTopicUploads: "DELETE /api/uploads/topic/:topicId",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    requestedUrl: req.originalUrl,
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.log("MONGO_URI is missing in .env file");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Open: http://localhost:${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`TTS audio folder: http://localhost:${PORT}/tts-audio`);
      console.log(`Uploads API: http://localhost:${PORT}/api/uploads`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error.message);
    process.exit(1);
  });