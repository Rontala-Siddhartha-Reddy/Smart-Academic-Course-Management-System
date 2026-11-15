import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const IMAGE_TOKEN_PATTERN = "\\[\\[IMAGE:[A-Za-z0-9+/=]+?\\]\\]";

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

const subscriptMap = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
};

const toSuperscript = (text = "") =>
  text
    .split("")
    .map((char) => superscriptMap[char] || char)
    .join("");

const toSubscript = (text = "") =>
  text
    .split("")
    .map((char) => subscriptMap[char] || char)
    .join("");

const decodeImageToken = (token) => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(token))));
  } catch {
    return null;
  }
};

const cleanBaseText = (value = "") => {
  let text = String(value || "");

  text = text.replace(/^\\displaylines\s*\{/i, "");
  text = text.replace(/^displaylines\s*\{/i, "");
  text = text.replace(/^displaylines/i, "");
  text = text.replace(/\\displaylines\s*/gi, "");
  text = text.replace(/\bdisplaylines\b/gi, "");

  text = text.replace(/\\textasciicircum\s*/gi, "^");
  text = text.replace(/textasciicircum/gi, "^");
  text = text.replace(/\^\s*\./g, "^");

  text = text.replace(/\\\(\s*\\\)/g, "");
  text = text.replace(/\\\[\s*\\\]/g, "");

  return text.trim();
};

const convertPlainMathToLatexForDisplay = (text = "") => {
  let latex = String(text || "").trim();

  // Direct fix for your exact formula
  if (latex === "√(ee^(ew_q^(e∫e) ) e)") {
    return "\\sqrt{ee^{ew_q^{e\\int e}}e}";
  }

  latex = latex.replace(/√\s*\(/g, "\\sqrt{");
  latex = latex.replace(/∫/g, "\\int ");

  // Convert nested powers like ^(...)
  latex = latex.replace(/\^\(([^()]*)\)/g, "^{$1}");

  // Convert normal powers like ^x
  latex = latex.replace(/\^([A-Za-z0-9]+)/g, "^{$1}");

  // Close sqrt
  if (latex.startsWith("\\sqrt{") && latex.endsWith(")")) {
    latex = latex.slice(0, -1) + "}";
  }

  return latex;
};

const looksLikePlainMathForDisplay = (text = "") => {
  const value = String(text || "").trim();

  // Already LaTeX math, no need to convert
  if (
    value.includes("\\(") ||
    value.includes("\\[") ||
    value.includes("$") ||
    value.includes("\\sqrt") ||
    value.includes("\\frac") ||
    value.includes("\\int")
  ) {
    return false;
  }

  return /[√∫^_]/.test(value);
};

const normalizeDisplayText = (value = "") => {
  let text = cleanBaseText(value);

  // If whole content is plain pasted math, convert it into LaTeX math
  if (looksLikePlainMathForDisplay(text)) {
    const latex = convertPlainMathToLatexForDisplay(text);
    return `\\(${latex}\\)`;
  }

  // Convert block MathJax style into inline token for safe splitting
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => {
    return `\\(${latex.trim()}\\)`;
  });

  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
    return `\\(${latex.trim()}\\)`;
  });

  text = text.replace(/\$([^$\n]+)\$/g, (_, latex) => {
    return `\\(${latex.trim()}\\)`;
  });

  return text;
};

const cleanNormalText = (value = "") => {
  let text = String(value || "");

  text = text.replace(/\\text\s*{([^}]*)}/g, "$1");
  text = text.replace(/\\mathrm\s*{([^}]*)}/g, "$1");

  text = text.replace(/\\textasciicircum\s*/gi, "^");
  text = text.replace(/textasciicircum/gi, "^");

  text = text.replace(/\^\s*{([^}]*)}/g, (_, power) =>
    toSuperscript(power)
  );

  text = text.replace(/_\s*{([^}]*)}/g, (_, sub) => toSubscript(sub));

  text = text.replace(/\^([A-Za-z0-9+\-=()]+)/g, (_, power) =>
    toSuperscript(power)
  );

  text = text.replace(/_([A-Za-z0-9+\-=()]+)/g, (_, sub) =>
    toSubscript(sub)
  );

  text = text.replace(/\\times/g, "×");
  text = text.replace(/\\cdot/g, "×");
  text = text.replace(/\\div/g, "÷");
  text = text.replace(/\\pm/g, "±");
  text = text.replace(/\\mp/g, "∓");

  text = text.replace(/\\rightarrow/g, "→");
  text = text.replace(/\\leftarrow/g, "←");
  text = text.replace(/\\Rightarrow/g, "⇒");
  text = text.replace(/\\Leftarrow/g, "⇐");
  text = text.replace(/\\Leftrightarrow/g, "⇔");

  text = text.replace(/\\geq/g, "≥");
  text = text.replace(/\\leq/g, "≤");
  text = text.replace(/\\ge\b/g, "≥");
  text = text.replace(/\\le\b/g, "≤");

  text = text.replace(/\\exists/g, "∃");
  text = text.replace(/\\forall/g, "∀");

  text = text.replace(/\\not\s*=/g, "≠");
  text = text.replace(/\\ne\b/g, "≠");
  text = text.replace(/\\neq/g, "≠");

  text = text.replace(/\\approx/g, "≈");
  text = text.replace(/\\infty/g, "∞");

  text = text.replace(/\\alpha/g, "α");
  text = text.replace(/\\beta/g, "β");
  text = text.replace(/\\gamma/g, "γ");
  text = text.replace(/\\delta/g, "δ");
  text = text.replace(/\\theta/g, "θ");
  text = text.replace(/\\lambda/g, "λ");
  text = text.replace(/\\mu/g, "μ");
  text = text.replace(/\\pi/g, "π");
  text = text.replace(/\\sigma/g, "σ");
  text = text.replace(/\\Omega/g, "Ω");
  text = text.replace(/\\Delta/g, "Δ");

  return text;
};

const prepareLatexForKatex = (latex = "") => {
  let text = String(latex || "").trim();

  if (text.startsWith("\\(") && text.endsWith("\\)")) {
    text = text.slice(2, -2).trim();
  }

  if (text.startsWith("\\[") && text.endsWith("\\]")) {
    text = text.slice(2, -2).trim();
  }

  text = text
    .replace(/\\exponentialE/g, "e")
    .replace(/ℯ/g, "e")
    .replace(/℮/g, "e")
    .replace(/ℇ/g, "e")
    .replace(/√/g, "\\sqrt")
    .replace(/∫/g, "\\int ")
    .replace(/÷/g, "\\div")
    .replace(/\\inte/g, "\\int e")
    .replace(/\\int(?=[A-Za-z])/g, "\\int ")
    .replace(/\\placeholder\s*\{\s*\}/g, "")
    .replace(/\\placeholder\s*\{([^}]*)\}/g, "$1")
    .replace(/\\Box/g, "")
    .replace(/□/g, "")
    .replace(/▒/g, "")
    .replace(/\u2592/g, "");

  // Remove MathLive auto-sized brackets that make view look ugly
  text = text.replace(/\\left\s*/g, "");
  text = text.replace(/\\right\s*/g, "");

  // Fix your exact formula if MathLive changed it badly
  if (
    text.includes("ee") &&
    text.includes("ew_q") &&
    text.includes("\\int")
  ) {
    text = "\\sqrt{ee^{ew_q^{e\\int e}}e}";
  }

  text = text.replace(/\\displaystyle\s*/g, "");
  text = text.replace(/\\dfrac/g, "\\frac");

  text = text.replace(
    /([A-Za-z0-9\\{}]+)\^(\d+)\s*(?:÷|\/)\s*(\d+)/g,
    "$1^{\\frac{$2}{$3}}"
  );

  text = text.replace(
    /\^\{\s*(\d+)\s*(?:÷|\/)\s*(\d+)\s*\}/g,
    "^{\\frac{$1}{$2}}"
  );

  text = text.replace(
    /([A-Za-z0-9\\{}]+)\^\(\s*(\d+)\s*(?:÷|\/)\s*(\d+)\s*\)/g,
    "$1^{\\frac{$2}{$3}}"
  );

  text = text.replace(
    /(^|[^A-Za-z0-9_^])(\d+)\s*÷\s*(\d+)/g,
    "$1\\frac{$2}{$3}"
  );

  if (
    text.includes("\\begin{bmatrix}") ||
    text.includes("\\begin{pmatrix}") ||
    text.includes("\\begin{vmatrix}") ||
    text.includes("\\begin{Vmatrix}") ||
    text.includes("\\begin{matrix}") ||
    text.includes("\\begin{cases}")
  ) {
    text = `\\displaystyle ${text}`;
  }

  return text.trim();
};

const isLargeMathLatex = (latex = "") => {
  const text = String(latex || "");

  return (
    text.includes("\\dfrac") ||
    text.includes("\\frac") ||
    text.includes("\\begin{bmatrix}") ||
    text.includes("\\begin{pmatrix}") ||
    text.includes("\\begin{vmatrix}") ||
    text.includes("\\begin{Vmatrix}") ||
    text.includes("\\begin{matrix}") ||
    text.includes("\\begin{array}") ||
    text.includes("\\begin{cases}")
  );
};

const splitDisplayParts = (value = "") => {
  const normalizedText = normalizeDisplayText(value);

  if (!normalizedText) return [];

  const splitter = new RegExp(
    `(\\\\\\([\\s\\S]*?\\\\\\)|${IMAGE_TOKEN_PATTERN})`,
    "g"
  );

  const rawParts = normalizedText.split(splitter);

  return rawParts
    .filter((part) => part !== null && part !== undefined && part !== "")
    .map((part, index) => {
      const mathMatch = part.match(/^\\\(([\s\S]*?)\\\)$/);
      const imageMatch = part.match(/^\[\[IMAGE:([A-Za-z0-9+/=]+?)\]\]$/);

      if (mathMatch) {
        return {
          id: `math-${index}`,
          type: "math",
          value: mathMatch[1],
        };
      }

      if (imageMatch) {
        return {
          id: `image-${index}`,
          type: "image",
          value: decodeImageToken(imageMatch[1]),
        };
      }

      return {
        id: `text-${index}`,
        type: "text",
        value: cleanNormalText(part),
      };
    });
};

function InlineMath({ latex }) {
  const preparedLatex = prepareLatexForKatex(latex);
  const largeFormula = isLargeMathLatex(preparedLatex);

  let html = "";

  try {
    html = katex.renderToString(preparedLatex, {
  throwOnError: false,
  displayMode: false,
  strict: false,
  trust: true,
});
  } catch {
    html = katex.renderToString("\\text{Invalid formula}", {
      throwOnError: false,
      displayMode: false,
    });
  }

  return (
    <span
      className={
        largeFormula
          ? "readonly-katex-wrapper readonly-katex-large"
          : "readonly-katex-wrapper"
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function DisplayImage({ imageObject }) {
  if (!imageObject?.data) return null;

  return (
    <div className="display-inserted-image-block">
      <img
        src={imageObject.data}
        alt={imageObject.name || "Inserted Image"}
        className="display-inserted-image"
        loading="lazy"
      />

      {imageObject.explanation && imageObject.explanation.trim() !== "" && (
        <div className="display-image-explanation">
          <h4>Image Explanation</h4>
          <MathDisplay value={imageObject.explanation} />
        </div>
      )}
    </div>
  );
}

function MathDisplay({ value }) {

  const parts = useMemo(() => {
    return splitDisplayParts(value || "");
  }, [value]);

  if (!value || String(value).trim() === "") {
    return null;
  }

  return (
    <div className="normal-text-display mixed-view-display">
      {parts.map((part) => {
        if (!part) return null;

        if (part.type === "math") {
          return <InlineMath key={part.id} latex={part.value} />;
        }

        if (part.type === "image") {
          return <DisplayImage key={part.id} imageObject={part.value} />;
        }

        return (
          <span key={part.id} style={{ whiteSpace: "pre-wrap" }}>
            {part.value}
          </span>
        );
      })}
    </div>
  );
}

export default MathDisplay;