import { useEffect, useMemo, useRef, useState } from "react";
import "mathlive";
import "./AiTopicLecturePlayer.css";

const writtenLanguages = [
  { label: "English", code: "en" },
  { label: "Telugu", code: "te" },
  { label: "Hindi", code: "hi" },
  { label: "Tamil", code: "ta" },
  { label: "Kannada", code: "kn" },
  { label: "Malayalam", code: "ml" },
];

const audioLanguages = [
  { label: "English", code: "en", browserVoiceCode: "en-US" },
  { label: "Telugu", code: "te", browserVoiceCode: "te-IN" },
  { label: "Hindi", code: "hi", browserVoiceCode: "hi-IN" },
  { label: "Tamil", code: "ta", browserVoiceCode: "ta-IN" },
  { label: "Kannada", code: "kn", browserVoiceCode: "kn-IN" },
  { label: "Malayalam", code: "ml", browserVoiceCode: "ml-IN" },
];

const getFirstValue = (object, keys = []) => {
  if (!object) return "";

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      String(object[key]).trim() !== ""
    ) {
      return String(object[key]);
    }
  }

  return "";
};

const stripMathDelimiters = (value = "") => {
  let text = String(value).trim();

  text = text.replace(/^\\\(/, "").replace(/\\\)$/, "");
  text = text.replace(/^\\\[/, "").replace(/\\\]$/, "");
  text = text.replace(/^\$\$/, "").replace(/\$\$$/, "");
  text = text.replace(/^\$/, "").replace(/\$$/, "");

  return text.trim();
};

const wrapFormula = (formula = "") => {
  const cleanFormula = stripMathDelimiters(formula);
  if (!cleanFormula) return "";
  return `\\(${cleanFormula}\\)`;
};

const normalizeMathDelimiters = (text = "") => {
  if (!text) return "";

  let value = String(text);

  value = value.replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => {
    return `\\(${latex.trim()}\\)`;
  });

  value = value.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
    return `\\(${latex.trim()}\\)`;
  });

  value = value.replace(/\$([^$\n]+)\$/g, (_, latex) => {
    return `\\(${latex.trim()}\\)`;
  });

  return value;
};

const encodeImageToken = (imageObject) => {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(imageObject))));
  } catch {
    return "";
  }
};

const decodeImageToken = (token) => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(token))));
  } catch {
    return null;
  }
};

const imageTokenRegex = /\[\[IMAGE:([\s\S]*?)\]\]/g;

const splitLectureContentBlocks = (value = "") => {
  if (!value) return [];

  const normalized = normalizeMathDelimiters(value);

  const parts = String(normalized).split(
    /(\\\([\s\S]*?\\\)|\[\[IMAGE:[\s\S]*?\]\])/g
  );

  return parts
    .map((part) => {
      if (!part) return null;

      const mathMatch = part.match(/^\\\(([\s\S]*?)\\\)$/);

      if (mathMatch) {
        return {
          type: "math",
          latex: mathMatch[1].trim(),
        };
      }

      const imageMatch = part.match(/^\[\[IMAGE:([\s\S]*?)\]\]$/);

      if (imageMatch) {
        const imageObject = decodeImageToken(imageMatch[1]);

        if (imageObject?.data) {
          return {
            type: "image",
            image: imageObject,
          };
        }

        return null;
      }

      return {
        type: "text",
        text: part,
      };
    })
    .filter(Boolean);
};

const cleanNormalLectureText = (text = "") => {
  if (!text) return "";

  let cleaned = String(text);

  cleaned = cleaned.replace(/^\\displaylines\s*\{/i, "");
  cleaned = cleaned.replace(/^displaylines\s*\{/i, "");
  cleaned = cleaned.replace(/^displaylines/i, "");
  cleaned = cleaned.replace(/\\displaylines\s*/gi, "");
  cleaned = cleaned.replace(/\bdisplaylines\b/gi, "");

  cleaned = cleaned.replace(/\\\\/g, "\n");

  cleaned = cleaned.replace(/\\textasciicircum\s*/gi, "^");
  cleaned = cleaned.replace(/textasciicircum/gi, "^");

  cleaned = cleaned.replace(/\\text\s*{([^}]*)}/g, "$1");
  cleaned = cleaned.replace(/\\mathrm\s*{([^}]*)}/g, "$1");

  cleaned = cleaned.replace(/\\\[/g, "");
  cleaned = cleaned.replace(/\\\]/g, "");
  cleaned = cleaned.replace(/\$\$/g, "");
  cleaned = cleaned.replace(/\$/g, "");

  cleaned = cleaned.replace(/\\times/g, "×");
  cleaned = cleaned.replace(/\\cdot/g, "×");
  cleaned = cleaned.replace(/\\div/g, "÷");
  cleaned = cleaned.replace(/\\pm/g, "±");
  cleaned = cleaned.replace(/\\rightarrow/g, "→");
  cleaned = cleaned.replace(/\\leftarrow/g, "←");
  cleaned = cleaned.replace(/\\geq/g, "≥");
  cleaned = cleaned.replace(/\\leq/g, "≤");
  cleaned = cleaned.replace(/\\neq/g, "≠");
  cleaned = cleaned.replace(/\\approx/g, "≈");

  cleaned = cleaned.replace(/^\{+/, "");
  cleaned = cleaned.replace(/\}+$/, "");
  cleaned = cleaned.replace(/\n\s*\}/g, "\n");
  cleaned = cleaned.replace(/\{\s*\n/g, "\n");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
};

const cleanLectureText = (text = "") => {
  if (!text) return "";

  const normalized = normalizeMathDelimiters(text);

  const parts = String(normalized).split(
    /(\\\([\s\S]*?\\\)|\[\[IMAGE:[\s\S]*?\]\])/g
  );

  const cleaned = parts
    .map((part) => {
      if (!part) return "";

      const mathMatch = part.match(/^\\\(([\s\S]*?)\\\)$/);

      if (mathMatch) {
        return `\\(${mathMatch[1].trim()}\\)`;
      }

      const imageMatch = part.match(/^\[\[IMAGE:([\s\S]*?)\]\]$/);

      if (imageMatch) {
        return part;
      }

      return cleanNormalLectureText(part);
    })
    .join(" ");

  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
};

const formatNormalMathSymbols = (text = "") => {
  if (!text) return "";

  const superscriptMap = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "+": "⁺",
    "-": "⁻",
    "=": "⁼",
    "(": "⁽",
    ")": "⁾",
    n: "ⁿ",
  };

  const toSuperscript = (value = "") =>
    value
      .split("")
      .map((char) => superscriptMap[char] || char)
      .join("");

  return String(text)
    .replace(/\\\^/g, "^")
    .replace(/\^\s*{([^}]*)}/g, (_, power) => toSuperscript(power))
    .replace(/\^([A-Za-z0-9+\-=()]+)/g, (_, power) => toSuperscript(power))
    .replace(/\\sqrt\s*{([^}]*)}/g, "√$1")
    .replace(/\\frac\s*{([^}]*)}\s*{([^}]*)}/g, "$1/$2")
    .replace(/\\sigma/g, "σ")
    .replace(/\\theta/g, "θ")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\pi/g, "π");
};

const matrixToSpeechText = (formula = "") => {
  const matrixMatch = formula.match(
    /\\begin\{(bmatrix|pmatrix|matrix|vmatrix|Vmatrix|array)\}([\s\S]*?)\\end\{\1\}/
  );

  if (!matrixMatch) return "";

  const matrixBody = matrixMatch[2];

  const rows = matrixBody
    .split(/\\\\/)
    .map((row) => row.trim())
    .filter(Boolean);

  const spokenRows = rows.map((row, rowIndex) => {
    const values = row
      .split("&")
      .map((value) => value.trim())
      .filter(Boolean);

    return `Row ${rowIndex + 1} contains ${values.join(", ")}.`;
  });

  return `This is a matrix with ${rows.length} rows. ${spokenRows.join(" ")}`;
};

const makeFormulaExpressionHuman = (value = "") => {
  let text = String(value || "").trim();

  if (!text) return "";

  text = text.replace(/\\dfrac/g, "\\frac");
  text = text.replace(/\\tfrac/g, "\\frac");
  text = text.replace(/\bdfrac\b/g, "frac");
  text = text.replace(/\btfrac\b/g, "frac");

  text = text.replace(/\\left/g, "");
  text = text.replace(/\\right/g, "");
  text = text.replace(/\\Big/g, "");
  text = text.replace(/\\big/g, "");
  text = text.replace(/\\middle/g, "");

  text = text.replace(
    /\\frac\s*{([^}]*)}\s*{([^}]*)}/g,
    (_, numerator, denominator) => {
      return `${makeFormulaExpressionHuman(
        numerator
      )} divided by ${makeFormulaExpressionHuman(denominator)}`;
    }
  );

  text = text.replace(
    /\bfrac\s*([A-Za-z0-9])\s*([A-Za-z0-9])\b/g,
    "$1 divided by $2"
  );

  text = text.replace(
    /\\sqrt\s*{([^}]*)}/g,
    (_, inside) => `square root of ${makeFormulaExpressionHuman(inside)}`
  );

  text = text.replace(/\\sqrt\s*([A-Za-z0-9]+)/g, "square root of $1");
  text = text.replace(/\bsqrt\s*([A-Za-z0-9]+)/gi, "square root of $1");

  text = text.replace(/\\sum/g, "summation");
  text = text.replace(/\\int/g, "integral");
  text = text.replace(/\\lim/g, "limit");
  text = text.replace(/\\sin/g, "sine");
  text = text.replace(/\\cos/g, "cosine");
  text = text.replace(/\\tan/g, "tangent");
  text = text.replace(/\\log/g, "log");
  text = text.replace(/\\ln/g, "natural log");

  text = text.replace(/\\sigma/g, "sigma");
  text = text.replace(/\bsigma\b/g, "sigma");
  text = text.replace(/\\theta/g, "theta");
  text = text.replace(/\\alpha/g, "alpha");
  text = text.replace(/\\beta/g, "beta");
  text = text.replace(/\\gamma/g, "gamma");
  text = text.replace(/\\delta/g, "delta");
  text = text.replace(/\\lambda/g, "lambda");
  text = text.replace(/\\mu/g, "mu");
  text = text.replace(/\\pi/g, "pi");
  text = text.replace(/\\omega/g, "omega");

  text = text.replace(/\^\s*{([^}]*)}/g, " power $1 ");
  text = text.replace(/\^([A-Za-z0-9]+)/g, " power $1 ");
  text = text.replace(/_\s*{([^}]*)}/g, " subscript $1 ");
  text = text.replace(/_([A-Za-z0-9]+)/g, " subscript $1 ");

  text = text.replace(/\\times/g, " multiplied by ");
  text = text.replace(/\\cdot/g, " multiplied by ");
  text = text.replace(/\\div/g, " divided by ");
  text = text.replace(/\\pm/g, " plus or minus ");
  text = text.replace(/\\leq/g, " less than or equal to ");
  text = text.replace(/\\geq/g, " greater than or equal to ");
  text = text.replace(/\\neq/g, " not equal to ");
  text = text.replace(/\\approx/g, " approximately equal to ");

  text = text.replace(/=/g, " equals ");
  text = text.replace(/\+/g, " plus ");
  text = text.replace(/-/g, " minus ");
  text = text.replace(/\*/g, " multiplied by ");
  text = text.replace(/\//g, " divided by ");

  text = text.replace(/([0-9])([A-Za-z])/g, "$1 $2");
  text = text.replace(/([0-9])square root/gi, "$1 square root");
  text = text.replace(/([0-9])divided by/gi, "$1 divided by");

  text = text.replace(/[{}]/g, " ");
  text = text.replace(/\\/g, " ");
  text = text.replace(/\s+/g, " ");

  return text.trim();
};

const formulaToSpeechText = (formula = "") => {
  let text = stripMathDelimiters(formula);

  if (!text) return "";

  text = text.replace(/\\dfrac/g, "\\frac");
  text = text.replace(/\\tfrac/g, "\\frac");
  text = text.replace(/\bdfrac\b/g, "frac");
  text = text.replace(/\btfrac\b/g, "frac");

  text = text.replace(/\\mathrm\s*{\s*d\s*}/g, "d");
  text = text.replace(/\\operatorname\s*{\s*d\s*}/g, "d");

  text = text.replace(
    /\\frac\s*{\s*d\s*}\s*{\s*d\s*([a-zA-Z])\s*}\s*([\s\S]*?)\s*(?:\\Big|\\big|\\left)?\|\s*_\s*{\s*([a-zA-Z])\s*=\s*([^}]*)\s*}/g,
    (_, variable, expression, evalVariable, evalValue) => {
      const spokenExpression = makeFormulaExpressionHuman(expression);
      return `d by d ${variable} of ${spokenExpression}, evaluated at ${evalVariable} equals ${evalValue}`;
    }
  );

  text = text.replace(
    /\\frac\s*{\s*d\s*}\s*{\s*d\s*([a-zA-Z])\s*}\s*([\s\S]*)/g,
    (_, variable, expression) => {
      const spokenExpression = makeFormulaExpressionHuman(expression);

      if (!spokenExpression) {
        return `d by d ${variable}`;
      }

      return `d by d ${variable} of ${spokenExpression}`;
    }
  );

  text = text.replace(
    /\b(?:dfrac|tfrac|frac)\s+d\s+d\s*([a-zA-Z])\s*([\s\S]*)/gi,
    (_, variable, expression) => {
      const spokenExpression = makeFormulaExpressionHuman(expression);

      if (!spokenExpression) {
        return `d by d ${variable}`;
      }

      return `d by d ${variable} of ${spokenExpression}`;
    }
  );

  text = text.replace(
    /\bd\s*\/\s*d\s*([a-zA-Z])\s*([\s\S]*)/gi,
    (_, variable, expression) => {
      const spokenExpression = makeFormulaExpressionHuman(expression);

      if (!spokenExpression) {
        return `d by d ${variable}`;
      }

      return `d by d ${variable} of ${spokenExpression}`;
    }
  );

  text = text.replace(
    /\\frac\s*{\s*\\partial\s*}\s*{\s*\\partial\s*([a-zA-Z])\s*}\s*([\s\S]*)/g,
    (_, variable, expression) => {
      const spokenExpression = makeFormulaExpressionHuman(expression);

      if (!spokenExpression) {
        return `partial derivative with respect to ${variable}`;
      }

      return `partial derivative with respect to ${variable} of ${spokenExpression}`;
    }
  );

  const matrixSpeech = matrixToSpeechText(text);

  text = text.replace(
    /\\begin\{(bmatrix|pmatrix|matrix|vmatrix|Vmatrix|array)\}[\s\S]*?\\end\{\1\}/g,
    matrixSpeech
  );

  text = text.replace(
    /\|\s*_\s*{\s*([a-zA-Z])\s*=\s*([^}]*)\s*}/g,
    " evaluated at $1 equals $2 "
  );

  text = text.replace(
    /\|\s*_\s*([a-zA-Z])\s*=\s*([A-Za-z0-9.]+)/g,
    " evaluated at $1 equals $2 "
  );

  text = makeFormulaExpressionHuman(text);

  return text.trim();
};

const buildFormulaAudioExplanation = (formula = "") => {
  const cleanFormula = stripMathDelimiters(formula);
  if (!cleanFormula) return "";

  const spokenFormula = formulaToSpeechText(cleanFormula);

  if (!spokenFormula) return "";

  return `\n\nThis formula means: ${spokenFormula}.`;
};

const combineMatterWithEquation = (matter = "", equation = "") => {
  const cleanMatter = cleanLectureText(matter);
  const cleanEquation = stripMathDelimiters(equation);

  if (!cleanMatter && !cleanEquation) return "";
  if (!cleanEquation) return cleanMatter;

  return `${cleanMatter}\n\nFormula / Equation:\n${wrapFormula(
    cleanEquation
  )}`.trim();
};

const combineExplanationWithEquation = (explanation = "", equation = "") => {
  const cleanExplanation = cleanLectureText(explanation || "");
  const formulaExplanation = buildFormulaAudioExplanation(equation);

  return `${cleanExplanation}${formulaExplanation}`.trim();
};

const cleanTextForSpeech = (text = "") => {
  if (!text) return "";

  const blocks = splitLectureContentBlocks(text);

  let speechText = blocks
    .map((block) => {
      if (block.type === "math") {
        return formulaToSpeechText(block.latex);
      }

      if (block.type === "image") {
        const explanation = block.image?.explanation || "";

        if (explanation.trim()) {
          return `An image is shown here. ${explanation}`;
        }

        return "An image or diagram is shown here.";
      }

      return block.text;
    })
    .join(" ");

  speechText = speechText.replace(/\bdfrac\b/gi, "frac");
  speechText = speechText.replace(/\btfrac\b/gi, "frac");

  speechText = speechText.replace(
    /\bfrac\s+d\s+d\s*([a-zA-Z])\s*([A-Za-z0-9^{}+\-*/(). ]*)/gi,
    (_, variable, expression) => {
      const spokenExpression = makeFormulaExpressionHuman(expression);

      if (!spokenExpression) {
        return `d by d ${variable}`;
      }

      return `d by d ${variable} of ${spokenExpression}`;
    }
  );

  speechText = speechText.replace(
    /\bfrac\s*([0-9])\s*([0-9])\b/gi,
    "$1 divided by $2"
  );

  speechText = speechText.replace(
    /\bsqrt\s*([A-Za-z0-9]+)\b/gi,
    "square root of $1"
  );

  speechText = makeFormulaExpressionHuman(speechText);

  return cleanNormalLectureText(speechText).trim();
};

const splitLongLatexIntoLines = (latex = "", maxLength = 75) => {
  const value = stripMathDelimiters(latex).trim();

  if (!value) return [];

  if (
    /\\begin\{(?:bmatrix|pmatrix|matrix|vmatrix|Vmatrix|array|cases)\}/.test(
      value
    )
  ) {
    return [value];
  }

  const isFullscreen =
    typeof document !== "undefined" &&
    document.fullscreenElement &&
    document.fullscreenElement.classList?.contains("ai-video-screen");

  const effectiveMaxLength = isFullscreen ? 140 : maxLength;

  const lines = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    if (char === "{") depth += 1;
    if (char === "}") depth = Math.max(0, depth - 1);

    current += char;

    const nextChar = value[i + 1] || "";

    const isGoodBreakPoint =
      depth === 0 &&
      current.length >= effectiveMaxLength &&
      (char === "+" ||
        char === "=" ||
        char === "," ||
        char === ";" ||
        char === "-" ||
        char === ")" ||
        nextChar === "+" ||
        nextChar === "=" ||
        nextChar === "-");

    if (isGoodBreakPoint) {
      lines.push(current.trim());
      current = "";
    }
  }

  if (current.trim()) {
    lines.push(current.trim());
  }

  return lines.length ? lines : [value];
};

function AiInlineMath({ latex }) {
  const mathRef = useRef(null);

  useEffect(() => {
    const mathField = mathRef.current;
    if (!mathField) return;

    try {
      mathField.setOptions({
        readOnly: true,
        virtualKeyboardMode: "off",
        virtualKeyboards: "none",
        defaultMode: "math",
        smartMode: false,
      });
    } catch {
      // ignore unsupported MathLive options
    }

    mathField.value = latex || "";
  }, [latex]);

  return (
    <math-field
      ref={mathRef}
      className="ai-readonly-inline-math"
      read-only
      virtual-keyboard-mode="off"
    ></math-field>
  );
}

function AiFormulaDisplay({ latex, isFullScreen }) {
  const formulaLines = useMemo(() => {
    return splitLongLatexIntoLines(latex, isFullScreen ? 140 : 55);
  }, [latex, isFullScreen]);

  if (!formulaLines.length) return null;

  if (formulaLines.length === 1) {
  return (
    <span className="ai-formula-display">
      <AiInlineMath latex={formulaLines[0]} />
    </span>
  );
}

  return (
    <span className="ai-long-formula-display">
      {formulaLines.map((line, index) => (
        <span className="ai-formula-line" key={`${line}-${index}`}>
          <AiInlineMath latex={line} />
        </span>
      ))}
    </span>
  );
}

function AiLectureImage({ image }) {
  if (!image?.data) return null;

  return (
    <div className="ai-lecture-image-block">
      <img
        src={image.data}
        alt={image.name || "Lecture Image"}
        className="ai-lecture-image"
        loading="lazy"
      />
    </div>
  );
}

function AiMixedWritingText({ value, isFullScreen }) {
  if (!value) return null;

  const blocks = splitLectureContentBlocks(value);

  return (
    <div className="ai-board-text">
      {blocks.map((block, index) => {
        if (block.type === "math") {
          return (
  <AiFormulaDisplay
  key={index}
  latex={block.latex}
  isFullScreen={isFullScreen}
/>
);
        }

        if (block.type === "image") {
          return <AiLectureImage key={index} image={block.image} />;
        }

        return (
          <span key={index} style={{ whiteSpace: "pre-wrap" }}>
            {formatNormalMathSymbols(cleanLectureText(block.text))}
          </span>
        );
      })}
    </div>
  );
}

const protectFormulasForTranslation = (text = "") => {
  const formulas = [];
  const images = [];

  const normalized = normalizeMathDelimiters(text);

  let protectedText = String(normalized).replace(imageTokenRegex, (match) => {
    const placeholder = `__IMAGE_${images.length}__`;
    images.push(match);
    return placeholder;
  });

  protectedText = protectedText.replace(/\\\([\s\S]*?\\\)/g, (match) => {
    const placeholder = `__FORMULA_${formulas.length}__`;
    formulas.push(match);
    return placeholder;
  });

  return { protectedText, formulas, images };
};

const restoreFormulasAfterTranslation = (text = "", formulas = [], images = []) => {
  let restored = String(text);

  formulas.forEach((formula, index) => {
    restored = restored.replaceAll(`__FORMULA_${index}__`, formula);
  });

  images.forEach((image, index) => {
    restored = restored.replaceAll(`__IMAGE_${index}__`, image);
  });

  return restored;
};

function AiTopicLecturePlayer({ topic, currentUser }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  const [translatedMatter, setTranslatedMatter] = useState("");
  const [translatedAudioMatter, setTranslatedAudioMatter] = useState("");
  const [translatedExplanation, setTranslatedExplanation] = useState("");

  const [writtenLanguage, setWrittenLanguage] = useState(writtenLanguages[0]);
  const [audioLanguage, setAudioLanguage] = useState(audioLanguages[0]);

  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const [playbackStatus, setPlaybackStatus] = useState("idle");

  const [volume, setVolume] = useState(0.8);
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [speed, setSpeed] = useState(35);
  const [voiceRate, setVoiceRate] = useState(0.9);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const boardRef = useRef(null);
  const videoScreenRef = useRef(null);

  const typingIndexRef = useRef(0);
  const tokensRef = useRef([]);

  const playRequestIdRef = useRef(0);
  const playbackStatusRef = useRef("idle");

  const audioEndedRef = useRef(false);
  const writingEndedRef = useRef(false);
  const lectureFinishedRef = useRef(false);
  const playLockRef = useRef(false);

  const translationRequestIdRef = useRef(0);
  const browserSpeechRef = useRef(null);

  const canViewHiddenExplanation = ["admin", "subadmin", "teacher", "staff"].includes(
    String(currentUser?.role || "").toLowerCase()
  );

  const lectureSections = useMemo(() => {
    if (!topic) return [];

    const theory = topic.theory || {};
    const problems = topic.problems || {};

    const makeSection = ({ title, matter, equation, explanation }) => {
      const cleanMatter = combineMatterWithEquation(matter, equation);
      const cleanExplanation = combineExplanationWithEquation(explanation, equation);

      return {
        title,
        matter: cleanMatter,
        explanation: cleanExplanation,
      };
    };

    const sections = [
      makeSection({
        title: "Theory Matter",
        matter: getFirstValue(theory, ["matter", "theoryMatter"]),
        equation: getFirstValue(theory, ["theoryEquation", "matterEquation"]),
        explanation: getFirstValue(theory, [
          "matterExplanation",
          "explanation",
          "theoryExplanation",
        ]),
      }),

      makeSection({
        title: "Example Problems",
        matter: getFirstValue(theory, [
          "examples",
          "exampleProblemsWithSolution",
          "exampleProblems",
        ]),
        equation: getFirstValue(theory, ["exampleEquation", "examplesEquation"]),
        explanation: getFirstValue(theory, [
          "examplesExplanation",
          "exampleExplanation",
        ]),
      }),

      {
        title: "Mind Map",
        matter: cleanLectureText(getFirstValue(theory, ["mindMap"])),
        explanation: cleanLectureText(
          getFirstValue(theory, ["mindMapExplanation"])
        ),
      },

      makeSection({
        title: "Questions",
        matter: getFirstValue(problems, ["questions", "question"]),
        equation: getFirstValue(problems, [
          "questionEquation",
          "questionsEquation",
        ]),
        explanation: getFirstValue(problems, [
          "questionsExplanation",
          "questionExplanation",
        ]),
      }),

      makeSection({
        title: "Solution",
        matter: getFirstValue(problems, ["solution", "solutions"]),
        equation: getFirstValue(problems, [
          "solutionEquation",
          "solutionsEquation",
        ]),
        explanation: getFirstValue(problems, [
          "solutionExplanation",
          "solutionsExplanation",
        ]),
      }),

      makeSection({
        title: "Related Theory",
        matter: getFirstValue(problems, ["relatedTheory"]),
        equation: getFirstValue(problems, ["relatedTheoryEquation"]),
        explanation: getFirstValue(problems, ["relatedTheoryExplanation"]),
      }),
    ];

    return sections.filter(
      (section) =>
        section.matter &&
        section.matter.trim() !== "" &&
        section.matter.trim() !== "Formula / Equation:"
    );
  }, [topic]);

  const currentSection = lectureSections[currentIndex];

  useEffect(() => {
    playbackStatusRef.current = playbackStatus;
  }, [playbackStatus]);

  useEffect(() => {
    prepareLanguageContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection, writtenLanguage, audioLanguage]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement === videoScreenRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearTyping();
      stopAllAudio();

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = voiceRate;
    }
  }, [volume, voiceRate]);

  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.scrollTop = boardRef.current.scrollHeight;
    }
  }, [displayedText]);

  const clearTyping = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopBrowserSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const stopGeneratedAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  const stopAllAudio = () => {
    stopBrowserSpeech();
    stopGeneratedAudio();

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  const handleFullScreenToggle = async () => {
    if (!videoScreenRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoScreenRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen failed:", error);
    }
  };

  const translateImageExplanationsInText = async (text = "", targetLang = "en") => {
    if (!text) return "";

    const matches = [...String(text).matchAll(imageTokenRegex)];

    if (!matches.length) return text;

    let updatedText = String(text);

    for (const match of matches) {
      const fullToken = match[0];
      const encodedToken = match[1];

      const imageObject = decodeImageToken(encodedToken);

      if (!imageObject?.data) continue;

      const originalExplanation = imageObject.explanation || "";

      if (!originalExplanation.trim()) continue;

      let translatedExplanation = originalExplanation;

      if (targetLang !== "en") {
        try {
          const { protectedText, formulas, images } =
            protectFormulasForTranslation(originalExplanation);

          const response = await fetch("http://localhost:5000/api/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: protectedText,
              targetLang,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            translatedExplanation = restoreFormulasAfterTranslation(
              data.translatedText || protectedText,
              formulas,
              images
            );
          }
        } catch (error) {
          console.error("Image explanation translation failed:", error);
        }
      }

      const updatedImageObject = {
        ...imageObject,
        explanation: translatedExplanation,
      };

      const newToken = `[[IMAGE:${encodeImageToken(updatedImageObject)}]]`;

      updatedText = updatedText.replace(fullToken, newToken);
    }

    return updatedText;
  };

  const translateText = async (text, targetLang) => {
    if (!text) return "";

    const textWithTranslatedImages = await translateImageExplanationsInText(
      text,
      targetLang
    );

    const { protectedText, formulas, images } =
      protectFormulasForTranslation(textWithTranslatedImages);

    if (targetLang === "en") {
      return restoreFormulasAfterTranslation(protectedText, formulas, images);
    }

    try {
      const response = await fetch("http://localhost:5000/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: protectedText,
          targetLang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Translation API error:", data);
        return textWithTranslatedImages;
      }

      const translated = data.translatedText || protectedText;

      return restoreFormulasAfterTranslation(translated, formulas, images);
    } catch (error) {
      console.error("Translation failed:", error);
      return textWithTranslatedImages;
    }
  };

  const prepareLanguageContent = async () => {
    if (!currentSection) return;

    clearTyping();
    stopAllAudio();

    typingIndexRef.current = 0;
    tokensRef.current = [];
    audioEndedRef.current = false;
    writingEndedRef.current = false;
    lectureFinishedRef.current = false;
    playLockRef.current = false;

    setDisplayedText("");
    setPlaybackStatus("idle");

    const requestId = translationRequestIdRef.current + 1;
    translationRequestIdRef.current = requestId;

    setIsTranslating(true);

    const writtenMatter = await translateText(
      currentSection.matter,
      writtenLanguage.code
    );

    const audioMatter = await translateText(
      currentSection.matter,
      audioLanguage.code
    );

    const explanationSource =
      currentSection.explanation && currentSection.explanation.trim() !== ""
        ? currentSection.explanation
        : "";

    const explanation = explanationSource
      ? await translateText(explanationSource, audioLanguage.code)
      : "";

    if (requestId !== translationRequestIdRef.current) {
      return;
    }

    setTranslatedMatter(cleanLectureText(writtenMatter));
    setTranslatedAudioMatter(cleanLectureText(audioMatter));
    setTranslatedExplanation(cleanLectureText(explanation));
    setIsTranslating(false);
  };

  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    return new Blob([byteArray], { type: mimeType });
  };

  const createTypingTokens = (text = "") => {
    const blocks = splitLectureContentBlocks(text);
    const tokens = [];

    blocks.forEach((block) => {
      if (block.type === "math") {
        tokens.push(` ${wrapFormula(block.latex)} `);
        return;
      }

      if (block.type === "image") {
        const imageOnlyObject = {
          ...block.image,
          explanation: "",
        };

        const imageOnlyToken = `[[IMAGE:${encodeImageToken(imageOnlyObject)}]]`;
        tokens.push(imageOnlyToken);

        const explanation = block.image?.explanation || "";

        if (explanation.trim() !== "") {
          const explanationText = `\n\nImage Explanation:\n${explanation}\n\n`;

          explanationText.split("").forEach((char) => {
            tokens.push(char);
          });
        }

        return;
      }

      cleanLectureText(block.text)
        .split("")
        .forEach((char) => {
          tokens.push(char);
        });
    });

    return tokens;
  };

  const finishOnlyWhenBothDone = () => {
    if (lectureFinishedRef.current) return;

    if (audioEndedRef.current && writingEndedRef.current) {
      lectureFinishedRef.current = true;
      playLockRef.current = false;

      clearTyping();

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      setPlaybackStatus("finished");
      return;
    }

    if (playbackStatusRef.current !== "paused") {
      setPlaybackStatus("playing");
    }
  };

  const createBrowserSpeechAudio = (textToSpeak) => {
    if (!("speechSynthesis" in window)) {
      alert("Voice speech is not supported in this browser.");
      return null;
    }

    const speech = new SpeechSynthesisUtterance(textToSpeak);
    speech.lang = audioLanguage.browserVoiceCode;
    speech.volume = volume;
    speech.rate = voiceRate;
    speech.pitch = 1;

    speech.onend = () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      audioEndedRef.current = true;
      finishOnlyWhenBothDone();
    };

    speech.onerror = () => {
      audioEndedRef.current = true;
      finishOnlyWhenBothDone();
    };

    return {
      type: "browser",
      play: () => {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
      },
      pause: () => {
        window.speechSynthesis.pause();
      },
      resume: () => {
        window.speechSynthesis.resume();
      },
      stop: () => {
        window.speechSynthesis.cancel();
      },
    };
  };

  const prepareGeneratedAudio = async (requestId) => {
    const audioSource =
      translatedExplanation && translatedExplanation.trim() !== ""
        ? translatedExplanation
        : translatedAudioMatter;

    const textToSpeak = cleanTextForSpeech(audioSource);

    if (!textToSpeak) return false;

    try {
      setIsGeneratingAudio(true);

      const response = await fetch("http://localhost:5000/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToSpeak,
          languageCode: audioLanguage.code,
        }),
      });

      const data = await response.json();

      if (requestId !== playRequestIdRef.current) {
        return false;
      }

      if (!response.ok || (!data.audioContent && !data.audioUrl)) {
        console.error("TTS API error:", data);

        const fallbackAudio = createBrowserSpeechAudio(textToSpeak);
        browserSpeechRef.current = fallbackAudio;

        return !!fallbackAudio;
      }

      let audioUrl = "";

      if (data.audioUrl) {
        audioUrl = data.audioUrl;
      } else {
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }

        const audioBlob = base64ToBlob(
          data.audioContent,
          data.mimeType || "audio/mpeg"
        );

        audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;
      }

      const audio = new Audio(audioUrl);
      audio.volume = volume;
      audio.playbackRate = voiceRate;
      audio.loop = false;

      audio.onended = () => {
        audio.pause();
        audio.currentTime = 0;
        audioEndedRef.current = true;
        finishOnlyWhenBothDone();
      };

      audio.onerror = () => {
        audioEndedRef.current = true;
        finishOnlyWhenBothDone();
      };

      audioRef.current = audio;
      browserSpeechRef.current = null;

      return true;
    } catch (error) {
      console.error("Audio generation failed:", error);

      const fallbackAudio = createBrowserSpeechAudio(textToSpeak);
      browserSpeechRef.current = fallbackAudio;

      return !!fallbackAudio;
    } finally {
      if (requestId === playRequestIdRef.current) {
        setIsGeneratingAudio(false);
      }
    }
  };

  const startTyping = () => {
    clearTyping();

    const tokens = tokensRef.current;
    let index = typingIndexRef.current;

    intervalRef.current = setInterval(() => {
      if (playbackStatusRef.current !== "playing") {
        clearTyping();
        return;
      }

      if (index >= tokens.length) {
        writingEndedRef.current = true;
        clearTyping();
        finishOnlyWhenBothDone();
        return;
      }

      const nextText = tokens.slice(0, index + 1).join("");

      setDisplayedText(nextText);

      index += 1;
      typingIndexRef.current = index;
    }, speed);
  };

  const handlePlay = async () => {
    if (!translatedMatter || isTranslating) return;
    if (playLockRef.current) return;

    playLockRef.current = true;
    lectureFinishedRef.current = false;

    clearTyping();
    stopAllAudio();

    playRequestIdRef.current += 1;
    const requestId = playRequestIdRef.current;

    typingIndexRef.current = 0;
    tokensRef.current = createTypingTokens(translatedMatter);

    audioEndedRef.current = false;
    writingEndedRef.current = false;

    setDisplayedText("");
    setPlaybackStatus("loading");

    const audioPrepared = await prepareGeneratedAudio(requestId);

    if (requestId !== playRequestIdRef.current) return;

    if (!audioPrepared) {
      playLockRef.current = false;
      setPlaybackStatus("idle");
      return;
    }

    setPlaybackStatus("playing");

    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } else if (browserSpeechRef.current) {
        browserSpeechRef.current.play();
      }
    } catch (error) {
      console.error("Audio play failed:", error);
      audioEndedRef.current = true;
      finishOnlyWhenBothDone();
    }

    startTyping();
  };

  const handlePause = () => {
    if (
      playbackStatusRef.current !== "playing" &&
      playbackStatusRef.current !== "loading"
    ) {
      return;
    }

    clearTyping();

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (browserSpeechRef.current) {
      browserSpeechRef.current.pause();
    }

    setPlaybackStatus("paused");
  };

  const handleResume = async () => {
    if (playbackStatusRef.current !== "paused") return;

    setPlaybackStatus("playing");

    try {
      if (audioRef.current && !audioEndedRef.current) {
        await audioRef.current.play();
      } else if (browserSpeechRef.current && !audioEndedRef.current) {
        browserSpeechRef.current.resume();
      }
    } catch (error) {
      console.error("Audio resume failed:", error);
      audioEndedRef.current = true;
    }

    if (!writingEndedRef.current) {
      startTyping();
    }

    finishOnlyWhenBothDone();
  };

  const handleRestart = () => {
    handleStop();

    setTimeout(() => {
      playLockRef.current = false;
      handlePlay();
    }, 150);
  };

  const handleStop = () => {
    clearTyping();

    if (browserSpeechRef.current) {
      browserSpeechRef.current.stop();
      browserSpeechRef.current = null;
    }

    stopAllAudio();

    playRequestIdRef.current += 1;

    typingIndexRef.current = 0;
    tokensRef.current = [];

    audioEndedRef.current = false;
    writingEndedRef.current = false;
    lectureFinishedRef.current = false;
    playLockRef.current = false;

    setDisplayedText("");
    setIsGeneratingAudio(false);
    setPlaybackStatus("idle");
  };

  const handleNext = () => {
    if (currentIndex < lectureSections.length - 1) {
      handleStop();
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleStop();
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleLectureSelect = (event) => {
    const selectedIndex = Number(event.target.value);

    if (Number.isNaN(selectedIndex)) return;

    handleStop();
    setCurrentIndex(selectedIndex);
  };

  if (!topic) {
    return (
      <div className="ai-lecture-empty">
        <h2>Topic not loaded</h2>
        <p>Please wait until topic content is loaded.</p>
      </div>
    );
  }

  if (!lectureSections.length) {
    return (
      <div className="ai-lecture-empty">
        <h2>No AI Lecture matter available</h2>
        <p>
          Add theory matter, examples, mind map, questions, solution, related
          theory, explanations, or equation fields to create an AI lecture.
        </p>
      </div>
    );
  }

  const isBusy = playbackStatus === "loading" || playbackStatus === "playing";

  const previewText = cleanTextForSpeech(
    translatedExplanation && translatedExplanation.trim() !== ""
      ? translatedExplanation
      : translatedAudioMatter
  );

  return (
    <div className="ai-lecture-page">
      <div className="ai-lecture-top">
        <div>
          <p className="ai-small-label">AI Lecture Mode</p>
          <h2>{topic.topicName || "Topic"}</h2>
          <p>
            Select a lecture, press Play, and view the writing board with audio.
          </p>
        </div>

        <div className="language-controls">
          <div className="language-box lecture-select-box">
            <label>Select Lecture</label>
            <select
              value={currentIndex}
              disabled={isBusy || playbackStatus === "paused"}
              onChange={handleLectureSelect}
            >
              {lectureSections.map((section, index) => (
                <option key={`${section.title}-${index}`} value={index}>
                  {section.title}
                </option>
              ))}
            </select>
          </div>

          <div className="language-box">
            <label>Written Matter Language</label>
            <select
              value={writtenLanguage.code}
              disabled={isBusy || playbackStatus === "paused"}
              onChange={(event) => {
                const selected = writtenLanguages.find(
                  (language) => language.code === event.target.value
                );

                if (selected) {
                  setWrittenLanguage(selected);
                }
              }}
            >
              {writtenLanguages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>

          <div className="language-box">
            <label>Audio Language</label>
            <select
              value={audioLanguage.code}
              disabled={isBusy || playbackStatus === "paused"}
              onChange={(event) => {
                const selected = audioLanguages.find(
                  (language) => language.code === event.target.value
                );

                if (selected) {
                  setAudioLanguage(selected);
                }
              }}
            >
              {audioLanguages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div
        ref={videoScreenRef}
        className="ai-video-screen"
        style={{
          filter: `brightness(${brightness}%)`,
          transform: `scale(${zoom / 100})`,
        }}
      >
        <button
          type="button"
          className="ai-fullscreen-icon-btn"
          onClick={handleFullScreenToggle}
          title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullScreen ? "⤢" : "⛶"}
        </button>

        <div className="ai-teacher-area">
          <div className="ai-avatar">AI</div>

          <div>
            <h3>{currentSection.title}</h3>
            <p>
              Lecture {currentIndex + 1} of {lectureSections.length}
            </p>
          </div>
        </div>

        <div className="ai-writing-board" ref={boardRef}>
          {isTranslating ? (
            <div className="ai-loading-box">
              <div className="ai-loader"></div>
              <p>Changing language...</p>
            </div>
          ) : playbackStatus === "loading" ? (
            <div className="ai-loading-box">
              <div className="ai-loader"></div>
              <p>Preparing audio first. Writing will start with audio...</p>
            </div>
          ) : (
            <>
              <AiMixedWritingText value={displayedText} isFullScreen={isFullScreen} />

              {playbackStatus === "playing" && !writingEndedRef.current && (
                <span className="cursor">|</span>
              )}

              {!displayedText && playbackStatus === "idle" && (
                <p className="ai-start-hint">Press Play to start this lecture.</p>
              )}

              {playbackStatus === "paused" && (
                <p className="ai-audio-status">Paused</p>
              )}

              {isGeneratingAudio && (
                <p className="ai-audio-status">Generating audio...</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="main-controls">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isBusy || playbackStatus === "paused"}
        >
          Previous
        </button>

        {playbackStatus === "idle" && displayedText.length === 0 && (
          <button onClick={handlePlay} disabled={isTranslating}>
            Play
          </button>
        )}

        {playbackStatus === "loading" && <button disabled>Preparing...</button>}

        {playbackStatus === "playing" && (
          <button onClick={handlePause}>Pause</button>
        )}

        {playbackStatus === "paused" && (
          <button onClick={handleResume}>Resume</button>
        )}

        {playbackStatus === "finished" && (
          <button onClick={handleRestart}>Replay</button>
        )}

        <button
          onClick={handleRestart}
          disabled={isTranslating || playbackStatus === "loading"}
        >
          Restart
        </button>

        <button onClick={handleStop}>Stop</button>

        <button
          onClick={handleNext}
          disabled={
            currentIndex === lectureSections.length - 1 ||
            isBusy ||
            playbackStatus === "paused"
          }
        >
          Next
        </button>
      </div>

      <div className="settings-controls">
        <label>
          Volume
          <span>{Math.round(volume * 100)}%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </label>

        <label>
          Brightness
          <span>{brightness}%</span>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(event) => setBrightness(Number(event.target.value))}
          />
        </label>

        <label>
          Zoom
          <span>{zoom}%</span>
          <input
            type="range"
            min="80"
            max="130"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>

        <label>
          Writing Speed
          <span>{speed} ms</span>
          <input
            type="range"
            min="10"
            max="100"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
        </label>

        <label>
          Voice Speed
          <span>{voiceRate}x</span>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={voiceRate}
            onChange={(event) => setVoiceRate(Number(event.target.value))}
          />
        </label>
      </div>

      {canViewHiddenExplanation && previewText && (
        <div className="teacher-explanation-preview">
          <h4>Hidden Explanation Used for AI Audio</h4>
          <p>{previewText}</p>
        </div>
      )}

      <div className="section-progress">
        Lecture {currentIndex + 1} of {lectureSections.length}:{" "}
        {currentSection.title}
      </div>
    </div>
  );
}

export default AiTopicLecturePlayer;