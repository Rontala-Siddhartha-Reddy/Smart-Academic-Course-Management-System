const express = require("express");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const router = express.Router();

const ensureAudioFolder = () => {
  const audioFolder = path.join(__dirname, "..", "tts-audio");

  if (!fs.existsSync(audioFolder)) {
    fs.mkdirSync(audioFolder, { recursive: true });
  }

  return audioFolder;
};

const runPythonWorker = (inputJsonPath) => {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(__dirname, "..", "tts_worker.py");

    execFile(
      "py",
      [workerPath, inputJsonPath],
      {
        timeout: 120000,
        maxBuffer: 1024 * 1024 * 20,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `Python worker failed. stdout: ${stdout || ""} stderr: ${
                stderr || ""
              } error: ${error.message}`
            )
          );
          return;
        }

        try {
          const lines = stdout.trim().split(/\r?\n/);
          const lastLine = lines[lines.length - 1];
          const result = JSON.parse(lastLine);

          if (!result.success) {
            reject(new Error(result.error || "TTS worker failed"));
            return;
          }

          resolve(result);
        } catch (parseError) {
          reject(
            new Error(
              `Could not parse Python output. stdout: ${stdout} stderr: ${stderr}`
            )
          );
        }
      }
    );
  });
};

router.post("/", async (req, res) => {
  let inputJsonPath = "";
  let outputPath = "";

  try {
    const { text, languageCode } = req.body;

    if (!text || !languageCode) {
      return res.status(400).json({
        message: "text and languageCode are required",
      });
    }

    const cleanText = String(text).trim();

    if (!cleanText) {
      return res.status(400).json({
        message: "Text is empty",
      });
    }

    const audioFolder = ensureAudioFolder();

    const baseName = `tts-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    inputJsonPath = path.join(audioFolder, `${baseName}.json`);
    outputPath = path.join(audioFolder, `${baseName}.mp3`);

    fs.writeFileSync(
      inputJsonPath,
      JSON.stringify(
        {
          text: cleanText,
          languageCode,
          outputPath,
        },
        null,
        2
      ),
      "utf8"
    );

    const workerResult = await runPythonWorker(inputJsonPath);

    if (!fs.existsSync(outputPath)) {
      throw new Error("TTS audio file was not created");
    }

    const stats = fs.statSync(outputPath);

    if (stats.size <= 0) {
      throw new Error("TTS audio file is empty");
    }

    fs.unlink(inputJsonPath, () => {});

    const fileName = path.basename(outputPath);

    return res.status(200).json({
      audioUrl: `http://localhost:5000/tts-audio/${fileName}`,
      mimeType: "audio/mpeg",
      voice: workerResult.voice,
      languageCode,
    });
  } catch (error) {
    console.error("TTS route error:", error.message);

    if (inputJsonPath && fs.existsSync(inputJsonPath)) {
      fs.unlink(inputJsonPath, () => {});
    }

    if (outputPath && fs.existsSync(outputPath)) {
      fs.unlink(outputPath, () => {});
    }

    return res.status(500).json({
      message: "TTS generation failed",
      error: error.message,
    });
  }
});

module.exports = router;