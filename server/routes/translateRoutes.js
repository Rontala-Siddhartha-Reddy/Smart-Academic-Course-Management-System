const express = require("express");

const router = express.Router();

let translateFunction = null;

const getTranslateFunction = async () => {
  if (!translateFunction) {
    const module = await import("google-translate-api-x");
    translateFunction = module.default || module.translate || module;
  }

  return translateFunction;
};

router.post("/", async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({
        message: "text and targetLang are required",
      });
    }

    if (targetLang === "en") {
      return res.status(200).json({
        translatedText: text,
        targetLang,
      });
    }

    const translate = await getTranslateFunction();

    const result = await translate(text, {
      to: targetLang,
    });

    const translatedText =
      typeof result === "string"
        ? result
        : result?.text || result?.translation || text;

    return res.status(200).json({
      translatedText,
      targetLang,
    });
  } catch (error) {
    console.error("Translation error:", error);

    return res.status(500).json({
      message: "Translation failed",
      error: error.message,
    });
  }
});

module.exports = router;