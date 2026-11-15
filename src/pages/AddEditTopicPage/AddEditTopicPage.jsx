import { useRef, useState } from "react";
import MathEditor from "../../components/MathEditor";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import "./AddEditTopicPage.css";

const cleanEditorText = (text) => {
  if (!text) return "";

  return String(text)
    .replace(/^displaylines/i, "")
    .replace(/\bdisplaylines\b/gi, "")
    .replace(/\\displaylines\s*/gi, "")
    .replace(/\{\\displaylines\s*/gi, "")

    /* fix \textasciicircum showing in edit */
    .replace(/\\textasciicircum\s*/gi, "^")
    .replace(/textasciicircum\s*/gi, "^")

    /* fix common escaped LaTeX text commands */
    .replace(/\\text\s*{([^}]*)}/g, "$1")
    .replace(/\\mathrm\s*{([^}]*)}/g, "$1")

    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const latexToReadable = (value = "") => {
  return String(value)
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]*)\}/g, "√($1)")
    .replace(/\\sqrt\[3\]\{([^}]*)\}/g, "∛($1)")
    .replace(/\\sqrt\[4\]\{([^}]*)\}/g, "∜($1)")
    .replace(/\\sqrt\[n\]\{([^}]*)\}/g, "ⁿ√($1)")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\mp/g, "∓")
    .replace(/\\ne/g, "≠")
    .replace(/\\le/g, "≤")
    .replace(/\\ge/g, "≥")
    .replace(/\\approx/g, "≈")
    .replace(/\\equiv/g, "≡")
    .replace(/\\propto/g, "∝")
    .replace(/\\infty/g, "∞")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\epsilon/g, "ε")
    .replace(/\\theta/g, "θ")
    .replace(/\\lambda/g, "λ")
    .replace(/\\mu/g, "μ")
    .replace(/\\pi/g, "π")
    .replace(/\\rho/g, "ρ")
    .replace(/\\sigma/g, "σ")
    .replace(/\\tau/g, "τ")
    .replace(/\\phi/g, "φ")
    .replace(/\\omega/g, "ω")
    .replace(/\\partial/g, "∂")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\nabla/g, "∇")
    .replace(/\\int/g, "∫")
    .replace(/\\sum/g, "∑")
    .replace(/\\prod/g, "∏")
    .replace(/\\lim_\{x\\to 0\}/g, "lim x→0")
    .replace(/\\lim_\{x\\to \\infty\}/g, "lim x→∞")
    .replace(/\\lim_\{x\\to a\}/g, "lim x→a")
    .replace(/\\left/g, "")
    .replace(/\\right/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getButtonTooltip = (item) => {
  if (!item) return "";

  if (item.tooltip) {
    return item.tooltip;
  }

  return item.label ? `Insert ${item.label}` : "";
};

const makeBlank = () => "\\placeholder{}";

const normalizeRibbonLatex = (latex = "") => {
  return String(latex || "")
    .replace(/#\?/g, "\\placeholder{}")
    .trim();
};

const MATH_RIBBON_GROUPS = [
  {
    title: "Numbers",
    buttons: [
      { label: "0", value: "0" },
      { label: "1", value: "1" },
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" },
      { label: "5", value: "5" },
      { label: "6", value: "6" },
      { label: "7", value: "7" },
      { label: "8", value: "8" },
      { label: "9", value: "9" },
      { label: ".", value: "." },
      { label: ",", value: "," },
    ],
  },

  {
    title: "Basic",
    buttons: [
      { label: "+", value: "+" },
      { label: "−", value: "-" },
      { label: "×", value: "\\times " },
      { label: "÷", value: "\\div " },
      { label: "=", value: "=" },
      { label: "≠", value: "\\ne " },
      { label: "±", value: "\\pm " },
      { label: "∓", value: "\\mp " },
      { label: "<", value: "<" },
      { label: ">", value: ">" },
      { label: "≤", value: "\\le " },
      { label: "≥", value: "\\ge " },
      { label: "≈", value: "\\approx " },
      { label: "≡", value: "\\equiv " },
      { label: "∝", value: "\\propto " },
      { label: "∞", value: "\\infty " },
    ],
  },

  {
    title: "Powers",
    buttons: [
      { label: "□²", value: "{#?}^{2}", tooltip: "Blank value squared" },
      { label: "□³", value: "{#?}^{3}", tooltip: "Blank value cubed" },
      { label: "□ⁿ", value: "{#?}^{#?}", tooltip: "Blank base with blank power" },
      { label: "□₁", value: "{#?}_{1}", tooltip: "Blank value with subscript 1" },
      { label: "□ₙ", value: "{#?}_{#?}", tooltip: "Blank value with blank subscript" },
      { label: "eˣ", value: "e^{#?}", tooltip: "e power blank" },
      { label: "10ˣ", value: "10^{#?}", tooltip: "10 power blank" },
      { label: "aᵇ", value: "{#?}^{#?}", tooltip: "Blank base and exponent" },
    ],
  },

  {
    title: "Fractions",
    buttons: [
      {
        label: "□/□",
        value: "\\frac{#?}{#?}",
        tooltip: "Insert blank fraction",
      },
      {
        label: "a/b",
        value: "\\frac{#?}{#?}",
        tooltip: "Insert blank fraction",
      },
      {
        label: "⅓",
        value: "\\frac{1}{3}",
        tooltip: "Insert one by three",
      },
      {
        label: "⅔",
        value: "\\frac{2}{3}",
        tooltip: "Insert two by three",
      },
      {
        label: "¼",
        value: "\\frac{1}{4}",
        tooltip: "Insert one by four",
      },
      {
        label: "½",
        value: "\\frac{1}{2}",
        tooltip: "Insert one by two",
      },
      {
        label: "¾",
        value: "\\frac{3}{4}",
        tooltip: "Insert three by four",
      },
      {
        label: "dy/dx",
        value: "\\frac{dy}{dx}",
        tooltip: "Insert derivative fraction",
      },
      {
        label: "∂y/∂x",
        value: "\\frac{\\partial y}{\\partial x}",
        tooltip: "Insert partial derivative fraction",
      },
    ],
  },

  {
    title: "Radicals",
    buttons: [
      { label: "√□", value: "\\sqrt{#?}", tooltip: "Square root with blank box" },
      { label: "√□", value: "\\sqrt{#?}", tooltip: "Square root with blank box" },
      { label: "∛□", value: "\\sqrt[3]{#?}", tooltip: "Cube root with blank box" },
      { label: "∜□", value: "\\sqrt[4]{#?}", tooltip: "Fourth root with blank box" },
      { label: "ⁿ√□", value: "\\sqrt[#?]{#?}", tooltip: "Nth root with blank boxes" },
    ],
  },

  {
    title: "Greek",
    buttons: [
      { label: "α", value: "\\alpha " },
      { label: "β", value: "\\beta " },
      { label: "γ", value: "\\gamma " },
      { label: "δ", value: "\\delta " },
      { label: "ε", value: "\\epsilon " },
      { label: "ζ", value: "\\zeta " },
      { label: "η", value: "\\eta " },
      { label: "θ", value: "\\theta " },
      { label: "λ", value: "\\lambda " },
      { label: "μ", value: "\\mu " },
      { label: "π", value: "\\pi " },
      { label: "ρ", value: "\\rho " },
      { label: "σ", value: "\\sigma " },
      { label: "τ", value: "\\tau " },
      { label: "φ", value: "\\phi " },
      { label: "ω", value: "\\omega " },
      { label: "Γ", value: "\\Gamma " },
      { label: "Δ", value: "\\Delta " },
      { label: "Θ", value: "\\Theta " },
      { label: "Λ", value: "\\Lambda " },
      { label: "Π", value: "\\Pi " },
      { label: "Σ", value: "\\Sigma " },
      { label: "Φ", value: "\\Phi " },
      { label: "Ω", value: "\\Omega " },
    ],
  },

  {
    title: "Trigonometry",
    buttons: [
      { label: "sin", value: "\\sin ", tooltip: "Sine function" },
      { label: "cos", value: "\\cos ", tooltip: "Cosine function" },
      { label: "tan", value: "\\tan ", tooltip: "Tangent function" },
      { label: "cot", value: "\\cot ", tooltip: "Cotangent function" },
      { label: "sec", value: "\\sec ", tooltip: "Secant function" },
      { label: "csc", value: "\\csc ", tooltip: "Cosecant function" },
      { label: "sinθ", value: "\\sin\\theta ", tooltip: "Sine theta" },
      { label: "cosθ", value: "\\cos\\theta ", tooltip: "Cosine theta" },
      { label: "tanθ", value: "\\tan\\theta ", tooltip: "Tangent theta" },
    ],
  },

  {
    title: "Inverse Trigonometry",
    buttons: [
      { label: "sin⁻¹", value: "\\sin^{-1} ", tooltip: "Inverse sine function" },
      { label: "cos⁻¹", value: "\\cos^{-1} ", tooltip: "Inverse cosine function" },
      { label: "tan⁻¹", value: "\\tan^{-1} ", tooltip: "Inverse tangent function" },
      { label: "cot⁻¹", value: "\\cot^{-1} ", tooltip: "Inverse cotangent function" },
      { label: "sec⁻¹", value: "\\sec^{-1} ", tooltip: "Inverse secant function" },
      { label: "csc⁻¹", value: "\\csc^{-1} ", tooltip: "Inverse cosecant function" },
    ],
  },

  {
    title: "Hyperbolic",
    buttons: [
      { label: "sinh", value: "\\sinh ", tooltip: "Hyperbolic sine function" },
      { label: "cosh", value: "\\cosh ", tooltip: "Hyperbolic cosine function" },
      { label: "tanh", value: "\\tanh ", tooltip: "Hyperbolic tangent function" },
      { label: "coth", value: "\\coth ", tooltip: "Hyperbolic cotangent function" },
      { label: "sech", value: "\\operatorname{sech} ", tooltip: "Hyperbolic secant function" },
      { label: "csch", value: "\\operatorname{csch} ", tooltip: "Hyperbolic cosecant function" },
    ],
  },

  {
    title: "Probability",
    buttons: [
      { label: "P(A)", value: "P(#?)", tooltip: "Probability of an event" },
      { label: "P(A∩B)", value: "P(#? \\cap #?)", tooltip: "Probability of intersection" },
      { label: "P(A∪B)", value: "P(#? \\cup #?)", tooltip: "Probability of union" },
      { label: "P(A|B)", value: "P(#? \\mid #?)", tooltip: "Conditional probability" },
      { label: "E(X)", value: "E(#?)", tooltip: "Expected value" },
      { label: "Var(X)", value: "\\operatorname{Var}(#?)", tooltip: "Variance" },
      { label: "σ²", value: "\\sigma^{2}", tooltip: "Variance symbol" },
      { label: "σ", value: "\\sigma", tooltip: "Standard deviation symbol" },
      { label: "μ", value: "\\mu", tooltip: "Mean symbol" },
    ],
  },

  {
    title: "Vectors",
    buttons: [
      { label: "ā", value: "\\vec{#?}", tooltip: "Vector with blank value" },
      { label: "AB→", value: "\\overrightarrow{#?}", tooltip: "Vector from one point to another" },
      { label: "a·b", value: "\\vec{#?}\\cdot\\vec{#?}", tooltip: "Dot product of two vectors" },
      { label: "a×b", value: "\\vec{#?}\\times\\vec{#?}", tooltip: "Cross product of two vectors" },
      { label: "|a|", value: "|\\vec{#?}|", tooltip: "Magnitude of vector" },
      { label: "î", value: "\\hat{i}", tooltip: "Unit vector i" },
      { label: "ĵ", value: "\\hat{j}", tooltip: "Unit vector j" },
      { label: "k̂", value: "\\hat{k}", tooltip: "Unit vector k" },
    ],
  },

  {
    title: "Complex",
    buttons: [
      { label: "i", value: "i", tooltip: "Imaginary unit" },
      { label: "z", value: "z", tooltip: "Complex number z" },
      { label: "z̄", value: "\\bar{#?}", tooltip: "Conjugate of complex number" },
      { label: "|z|", value: "|#?|", tooltip: "Modulus of complex number" },
      { label: "Re(z)", value: "\\operatorname{Re}(#?)", tooltip: "Real part" },
      { label: "Im(z)", value: "\\operatorname{Im}(#?)", tooltip: "Imaginary part" },
      { label: "arg(z)", value: "\\arg(#?)", tooltip: "Argument of complex number" },
    ],
  },

  {
    title: "Linear Algebra",
    buttons: [
      { label: "Aᵀ", value: "{#?}^{T}", tooltip: "Transpose" },
      { label: "A⁻¹", value: "{#?}^{-1}", tooltip: "Inverse matrix" },
      { label: "det(A)", value: "\\det(#?)", tooltip: "Determinant" },
      { label: "rank(A)", value: "\\operatorname{rank}(#?)", tooltip: "Rank" },
      { label: "tr(A)", value: "\\operatorname{tr}(#?)", tooltip: "Trace" },
      { label: "Iₙ", value: "I_{#?}", tooltip: "Identity matrix of order n" },
      { label: "0", value: "\\mathbf{0}", tooltip: "Zero vector or zero matrix" },
    ],
  },

  {
    title: "Number Sets",
    buttons: [
      { label: "ℕ", value: "\\mathbb{N}", tooltip: "Set of natural numbers" },
      { label: "ℤ", value: "\\mathbb{Z}", tooltip: "Set of integers" },
      { label: "ℚ", value: "\\mathbb{Q}", tooltip: "Set of rational numbers" },
      { label: "ℝ", value: "\\mathbb{R}", tooltip: "Set of real numbers" },
      { label: "ℂ", value: "\\mathbb{C}", tooltip: "Set of complex numbers" },
    ],
  },

  {
    title: "Functions",
    buttons: [
      { label: "log", value: "\\log ", tooltip: "Logarithm function" },
      { label: "ln", value: "\\ln ", tooltip: "Natural logarithm function" },
      { label: "exp", value: "\\exp ", tooltip: "Exponential function" },
      { label: "lim", value: "\\lim_{#? \\to #?} ", tooltip: "Limit with blanks" },
      { label: "max", value: "\\max ", tooltip: "Maximum function" },
      { label: "min", value: "\\min ", tooltip: "Minimum function" },
      { label: "mod", value: "\\bmod ", tooltip: "Modulo operation" },
      { label: "|x|", value: "\\left| #? \\right|", tooltip: "Absolute value" },
      { label: "floor", value: "\\left\\lfloor #? \\right\\rfloor", tooltip: "Floor function" },
      { label: "ceil", value: "\\left\\lceil #? \\right\\rceil", tooltip: "Ceiling function" },
      { label: "f(x)", value: "f(#?)", tooltip: "Function notation" },
      { label: "g(x)", value: "g(#?)", tooltip: "Function notation" },
    ],
  },

  {
    title: "Calculus",
    buttons: [
      { label: "∫", value: "\\int ", tooltip: "Integral" },
      { label: "∬", value: "\\iint ", tooltip: "Double integral" },
      { label: "∭", value: "\\iiint ", tooltip: "Triple integral" },
      { label: "∮", value: "\\oint ", tooltip: "Contour integral" },
      {
        label: "∫ₐᵇ",
        value: "\\int_{#?}^{#?} #?\\,d#?",
        tooltip: "Definite integral with blanks",
      },
      {
        label: "∑",
        value: "\\sum_{#?=#?}^{#?} #?",
        tooltip: "Summation with blanks",
      },
      {
        label: "∏",
        value: "\\prod_{#?=#?}^{#?} #?",
        tooltip: "Product with blanks",
      },
      { label: "∂", value: "\\partial ", tooltip: "Partial derivative symbol" },
      { label: "∇", value: "\\nabla ", tooltip: "Nabla symbol" },
      { label: "Δ", value: "\\Delta ", tooltip: "Delta symbol" },
    ],
  },

  {
    title: "Sets",
    buttons: [
      { label: "∈", value: "\\in " },
      { label: "∉", value: "\\notin " },
      { label: "∋", value: "\\ni " },
      { label: "⊂", value: "\\subset " },
      { label: "⊆", value: "\\subseteq " },
      { label: "⊃", value: "\\supset " },
      { label: "⊇", value: "\\supseteq " },
      { label: "∪", value: "\\cup " },
      { label: "∩", value: "\\cap " },
      { label: "∅", value: "\\emptyset " },
      { label: "∀", value: "\\forall " },
      { label: "∃", value: "\\exists " },
      { label: "∄", value: "\\nexists " },
    ],
  },

  {
    title: "Arrows",
    buttons: [
      { label: "←", value: "\\leftarrow " },
      { label: "→", value: "\\rightarrow " },
      { label: "↑", value: "\\uparrow " },
      { label: "↓", value: "\\downarrow " },
      { label: "↔", value: "\\leftrightarrow " },
      { label: "⇒", value: "\\Rightarrow " },
      { label: "⇐", value: "\\Leftarrow " },
      { label: "⇔", value: "\\Leftrightarrow " },
      { label: "↦", value: "\\mapsto " },
    ],
  },

  {
    title: "Brackets",
    buttons: [
      {
        label: "( )",
        value: "\\left( #? \\right)",
        tooltip: "Insert scalable parenthesis brackets",
      },
      {
        label: "[ ]",
        value: "\\left[ #? \\right]",
        tooltip: "Insert scalable square brackets",
      },
      {
        label: "{ }",
        value: "\\left\\{ #? \\right\\}",
        tooltip: "Insert scalable curly braces",
      },
      {
        label: "| |",
        value: "\\left| #? \\right|",
        tooltip: "Insert absolute value brackets",
      },
      {
        label: "⌊ ⌋",
        value: "\\left\\lfloor #? \\right\\rfloor",
        tooltip: "Insert floor brackets",
      },
      {
        label: "⌈ ⌉",
        value: "\\left\\lceil #? \\right\\rceil",
        tooltip: "Insert ceiling brackets",
      },
      {
        label: "⟨ ⟩",
        value: "\\left\\langle #? \\right\\rangle",
        tooltip: "Insert angle brackets",
      },
    ],
  },

  {
    title: "Operators",
    buttons: [
      { label: "!", value: "!" },
      { label: "%", value: "\\% " },
      { label: "°", value: "^{\\circ}" },
      { label: "′", value: "'" },
      { label: "″", value: "''" },
      { label: "∴", value: "\\therefore " },
      { label: "∵", value: "\\because " },
      { label: "⊥", value: "\\perp " },
      { label: "∥", value: "\\parallel " },
      { label: "∠", value: "\\angle " },
      { label: "△", value: "\\triangle " },
    ],
  },

  {
    title: "Matrices",
    buttons: [
      {
        label: "Custom",
        action: "customMatrix",
        value: "customMatrix",
        tooltip: "Create custom matrix with selected rows and columns",
      },
      {
        label: "2×2 [ ]",
        value: "\\begin{bmatrix} #? & #? \\\\ #? & #? \\end{bmatrix}",
        tooltip: "Insert 2 by 2 square bracket matrix",
      },
      {
        label: "3×3 [ ]",
        value:
          "\\begin{bmatrix} #? & #? & #? \\\\ #? & #? & #? \\\\ #? & #? & #? \\end{bmatrix}",
        tooltip: "Insert 3 by 3 square bracket matrix",
      },
      {
        label: "2×2 ( )",
        value: "\\begin{pmatrix} #? & #? \\\\ #? & #? \\end{pmatrix}",
        tooltip: "Insert 2 by 2 parenthesis matrix",
      },
      {
        label: "3×3 ( )",
        value:
          "\\begin{pmatrix} #? & #? & #? \\\\ #? & #? & #? \\\\ #? & #? & #? \\end{pmatrix}",
        tooltip: "Insert 3 by 3 parenthesis matrix",
      },
      {
        label: "|A|",
        value: "\\begin{vmatrix} #? & #? \\\\ #? & #? \\end{vmatrix}",
        tooltip: "Insert determinant matrix",
      },
      {
        label: "Cases",
        value: "\\begin{cases} #?, & #? \\\\ #?, & #? \\end{cases}",
        tooltip: "Insert piecewise cases expression",
      },
    ],
  },
];

const getRibbonGroupByTitle = (title) => {
  return MATH_RIBBON_GROUPS.find((group) => group.title === title);
};

const mergeGroupButtons = (groupTitles = []) => {
  return groupTitles.flatMap((title) => getRibbonGroupByTitle(title)?.buttons || []);
};

const SYMBOL_LATEX_MAP = {
  "√": "\\sqrt{#?}",
  "∛": "\\sqrt[3]{#?}",
  "∜": "\\sqrt[4]{#?}",

  "∫": "\\int #? \\, d#?",
  "∬": "\\iint #? \\, d#?\\,d#?",
  "∭": "\\iiint #? \\, d#?\\,d#?\\,d#?",
  "∮": "\\oint #? \\, d#?",

  "∑": "\\sum_{#?=#?}^{#?} #?",
  "∏": "\\prod_{#?=#?}^{#?} #?",

  "C": "\\binom{#?}{#?}",

  "∆": "\\Delta ",
  "∇": "\\nabla ",
  "∂": "\\partial ",

  "∪": "\\cup ",
  "∩": "\\cap ",

  "| |": "\\left| #? \\right|",
  "( )": "\\left( #? \\right)",
  "[ ]": "\\left[ #? \\right]",
  "{ }": "\\left\\{ #? \\right\\}",
};

const makeButtons = (symbols = []) =>
  symbols.map((item) => {
    if (typeof item === "string") {
      return {
        label: item,
        value: SYMBOL_LATEX_MAP[item] || item,
        tooltip: `Insert ${item}`,
      };
    }

    return {
      ...item,
      value: SYMBOL_LATEX_MAP[item.label] || item.value,
    };
  });

const SYMBOL_RIBBON_MENUS = [
  {
    label: "Basic Math",
    sections: [
      {
        title: "Basic Math",
        buttons: makeButtons([
          "±", "∞", "=", "≠", "~", "×", "÷", "!", "∝", "<", "≪", ">", "≫",
          "≤", "≥", "∓", "≅", "≈", "≡", "∀",
          "C", "∂", "√", "∛", "∜", "∪", "∩", "∅", "%", "°", "℉", "℃",
          "∆", "∇", "∃", "∄", "∈", "∋",
          "←", "↑", "→", "↓", "↔",
          "∵", "+", "−", "¬",
          "α", "β", "γ", "δ", "ε", "ϵ", "θ", "ϑ", "μ", "π", "ρ", "σ", "τ",
          "φ", "ω", "*", "·", "⋮", "…", "⋰", "⋱", "ℵ", "∟", "■",
        ]),
      },
    ],
  },

  {
    label: "Greek Letters",
    sections: [
      {
        title: "Lowercase",
        buttons: makeButtons([
          "α", "β", "γ", "δ", "ε", "ϵ", "ζ", "η", "θ", "ϑ",
          "ι", "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ϖ", "ρ",
          "ϱ", "σ", "ς", "τ", "υ", "φ", "ϕ", "χ", "ψ", "ω",
        ]),
      },
      {
        title: "Uppercase",
        buttons: makeButtons([
          "Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ",
          "Ν", "Ξ", "Ο", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ", "Χ", "Ψ", "Ω",
        ]),
      },
    ],
  },

  {
    label: "Letter-Like Symbols",
    sections: [
      {
        title: "Letter-Like Symbols",
        buttons: makeButtons([
          "∀", "ℂ", "ℭ", "ð", "ℇ", "℉", "℩", "ℊ", "ℋ", "ℑ",
          "ℎ", "ℏ", "ℓ", "ℒ", "℘", "ℙ", "ℛ", "ℜ", "ℝ", "ℤ",
          "℧", "Å", "ℬ", "℮", "ℰ", "∃", "∄", "ℱ", "ℳ", "ℴ",
          "ℵ", "ℶ", "ℷ", "ℸ",
        ]),
      },
    ],
  },

  {
    label: "Operators",
    sections: [
      {
        title: "Common Binary Operators",
        buttons: makeButtons([
          "+", "−", "÷", "×", "±", "∓", "∝", "/", "*", "∘", "∙", "·",
          "∩", "∪", "⊎", "⊓", "⊔", "∧", "∨",
        ]),
      },
      {
        title: "Common Relational Operators",
        buttons: makeButtons([
          "=", "≠", "<", ">", "≤", "≥", "≮", "≯", "≰", "≱",
          "≡", "~", "≃", "≈", "≅", "≢", "≄", "≉", "≇", "∝",
          "≪", "≫", "∈", "∋", "∉", "⊂", "⊃", "⊆", "⊇",
          "⊄", "⊅", "⊈", "⊉", "∥", "⊥", "⊢", "⊣", "⋈", "≍",
        ]),
      },
      {
        title: "Basic N-ary Operators",
        buttons: makeButtons([
          "∑", "∫", "∬", "∭", "∮", "∯", "∰",
          "∏", "∐", "⋂", "⋃", "⋀", "⋁",
          "⨀", "⨂", "⨁", "⊎",
        ]),
      },
      {
        title: "Advanced Binary Operators",
        buttons: makeButtons([
          "∔", "∸", "\\", "⊍", "⊞", "⊠", "⊡", "⊟",
          "⊛", "⊗", "⊘", "⊙", "⊚", "⊕", "⊖", "⊝",
          "⊜", "⋉", "⋊", "⋋", "⋌", "⋏", "⋎", "⋒",
          "⋓", "⋄", "⋆", "⋇", "△", "▽", "◉",
        ]),
      },
      {
        title: "Advanced Relational Operators",
        buttons: makeButtons([
          "∴", "∵", "⋘", "⋙", "≦", "≧", "≲", "≳",
          "≺", "≻", "≼", "≽", "≾", "≿", "≜", "≝",
          "≞", "≟", "≌", "≊", "≃", "≂", "≶", "≷",
          "⋚", "⋛", "⊏", "⊐", "⊑", "⊒", "⊨", "⊩",
          "⊪", "⊫", "⊂", "⊃", "∥", "⋔", "≐", "≑",
          "≒", "≓", "≬",
        ]),
      },
    ],
  },

  {
    label: "Arrows",
    sections: [
      {
        title: "Arrows",
        buttons: makeButtons([
          "←", "→", "↑", "↓", "↔", "↕", "⇐", "⇒", "⇑", "⇓",
          "⇔", "⇕", "⟵", "⟶", "⟷", "⟸", "⟹", "⟺",
          "↗", "↖", "↘", "↙", "↢", "↣", "↤", "↦",
          "↩", "↪", "↫", "↬", "⇠", "⇢", "⇤", "⇥",
          "↽", "⇀", "↼", "⇁", "↿", "⇃", "↾", "⇂",
          "⇇", "⇉", "⇆", "⇄", "⇅", "⇵", "↶", "↷",
          "↻", "↺", "⊸", "↭", "⇝",
        ]),
      },
    ],
  },

  {
    label: "Negated Relations",
    sections: [
      {
        title: "Negated Relations",
        buttons: makeButtons([
          "≠", "≮", "≯", "≰", "≱", "≢", "≁", "≄", "≉", "≇",
          "≭", "≨", "≩", "⊀", "⊁", "⊄", "⊅", "⊈", "⊉",
          "⊊", "⊋", "⊬", "⊭", "⊮", "⊯", "∉", "∌", "∤",
          "∦", "≹", "≸",
        ]),
      },
    ],
  },

  {
    label: "Scripts",
    sections: [
      {
        title: "Script Uppercase",
        buttons: makeButtons([
          "𝒜", "ℬ", "𝒞", "𝒟", "ℰ", "ℱ", "𝒢", "ℋ", "ℐ", "𝒥",
          "𝒦", "ℒ", "ℳ", "𝒩", "𝒪", "𝒫", "𝒬", "ℛ", "𝒮", "𝒯",
        ]),
      },
      {
        title: "Script Lowercase",
        buttons: makeButtons([
          "𝒰", "𝒱", "𝒲", "𝒳", "𝒴", "𝒵",
          "𝒶", "𝒷", "𝒸", "𝒹", "ℯ", "𝒻", "ℊ", "𝒽", "𝒾", "𝒿",
          "𝓀", "𝓁", "𝓂", "𝓃", "ℴ", "𝓅", "𝓆", "𝓇", "𝓈", "𝓉",
          "𝓊", "𝓋", "𝓌", "𝓍", "𝓎", "𝓏",
        ]),
      },
    ],
  },

  {
    label: "Double-Struck",
    sections: [
      {
        title: "Double-Struck Uppercase",
        buttons: makeButtons([
          "𝔸", "𝔹", "ℂ", "𝔻", "𝔼", "𝔽", "𝔾", "ℍ", "𝕀", "𝕁",
          "𝕂", "𝕃", "𝕄", "ℕ", "𝕆", "ℙ", "ℚ", "ℝ", "𝕊", "𝕋",
          "𝕌", "𝕍", "𝕎", "𝕏", "𝕐", "ℤ",
        ]),
      },
      {
        title: "Double-Struck Lowercase",
        buttons: makeButtons([
          "𝕒", "𝕓", "𝕔", "𝕕", "𝕖", "𝕗", "𝕘", "𝕙", "𝕚", "𝕛",
          "𝕜", "𝕝", "𝕞", "𝕟", "𝕠", "𝕡", "𝕢", "𝕣", "𝕤", "𝕥",
          "𝕦", "𝕧", "𝕨", "𝕩", "𝕪", "𝕫",
        ]),
      },
    ],
  },

  {
    label: "Geometry",
    sections: [
      {
        title: "Geometry",
        buttons: makeButtons([
          "∟", "∠", "∡", "∢", "⊥", "△", "▱", "∥", "∦",
          "∶", "∷", "∴", "∵", "■",
        ]),
      },
    ],
  },

  {
    label: "Matrices",
    sections: [
      {
        title: "Matrices",
        buttons: mergeGroupButtons(["Matrices"]),
      },
    ],
  },

  {
    label: "Trigonometry",
    sections: [
      {
        title: "Basic Trigonometry",
        buttons: getRibbonGroupByTitle("Trigonometry")?.buttons || [],
      },
      {
        title: "Inverse Trigonometry",
        buttons: getRibbonGroupByTitle("Inverse Trigonometry")?.buttons || [],
      },
      {
        title: "Hyperbolic Functions",
        buttons: getRibbonGroupByTitle("Hyperbolic")?.buttons || [],
      },
    ],
  },

  {
    label: "Calculus",
    sections: [
      {
        title: "Calculus",
        buttons: mergeGroupButtons(["Calculus"]),
      },
    ],
  },
];

const STRUCTURE_RIBBON_MENUS = [
  {
    key: "Fraction",
    label: "Fraction",
    preview: "□/□",
    sections: [
      {
        title: "Fraction",
        items: [
          {
            label: "□/□",
            preview: "□\n―\n□",
            value: "\\frac{#?}{#?}",
            tooltip: "Stacked blank fraction",
          },
          {
            label: "□⁄□",
            preview: "□/□",
            value: "#?/#?",
            tooltip: "Linear blank fraction",
          },
        ],
      },
      {
        title: "Common Fraction",
        items: [
          {
            label: "dy/dx",
            value: "\\frac{dy}{dx}",
            tooltip: "Derivative fraction",
          },
          {
            label: "Δy/Δx",
            value: "\\frac{\\Delta y}{\\Delta x}",
            tooltip: "Delta fraction",
          },
          {
            label: "∂y/∂x",
            value: "\\frac{\\partial y}{\\partial x}",
            tooltip: "Partial derivative fraction",
          },
          {
            label: "δy/δx",
            value: "\\frac{\\delta y}{\\delta x}",
            tooltip: "Variation fraction",
          },
          {
            label: "π/2",
            value: "\\frac{\\pi}{2}",
            tooltip: "Pi by two",
          },
          {
            label: "1/2",
            value: "\\frac{1}{2}",
            tooltip: "One by two",
          },
          {
            label: "1/3",
            value: "\\frac{1}{3}",
            tooltip: "One by three",
          },
          {
            label: "3/4",
            value: "\\frac{3}{4}",
            tooltip: "Three by four",
          },
        ],
      },
    ],
  },

  {
    key: "Script",
    label: "Script",
    preview: "□ˣ",
    sections: [
      {
        title: "Subscripts and Superscripts",
        items: [
          {
            label: "□ˣ",
            preview: "□ˣ",
            value: "{#?}^{#?}",
            tooltip: "Blank base with superscript",
          },
          {
            label: "□ₓ",
            preview: "□ₓ",
            value: "{#?}_{#?}",
            tooltip: "Blank base with subscript",
          },
          {
            label: "□ₓʸ",
            preview: "□ₓʸ",
            value: "{#?}_{#?}^{#?}",
            tooltip: "Blank base with subscript and superscript",
          },
          {
            label: "ₓ□ʸ",
            preview: "ₓ□ʸ",
            value: "{}_{#?}{#?}^{#?}",
            tooltip: "Prescript and superscript structure",
          },
        ],
      },
      {
        title: "Common Subscripts and Superscripts",
        items: [
          {
            label: "xᵧ²",
            value: "x_{y}^{2}",
            tooltip: "x with y subscript and square",
          },
          {
            label: "e⁻ⁱωᵗ",
            value: "e^{-i\\omega t}",
            tooltip: "Euler exponential",
          },
          {
            label: "x²",
            value: "x^{2}",
            tooltip: "x squared",
          },
          {
            label: "₁ⁿY",
            value: "{}_{1}^{n}Y",
            tooltip: "Prescript notation",
          },
        ],
      },
    ],
  },

  {
    key: "Radical",
    label: "Radical",
    preview: "√□",
    sections: [
      {
        title: "Radicals",
        items: [
          {
            label: "√□",
            value: "\\sqrt{#?}",
            tooltip: "Square root",
          },
          {
            label: "ⁿ√□",
            value: "\\sqrt[#?]{#?}",
            tooltip: "Nth root",
          },
          {
            label: "³√□",
            value: "\\sqrt[3]{#?}",
            tooltip: "Cube root",
          },
          {
            label: "⁴√□",
            value: "\\sqrt[4]{#?}",
            tooltip: "Fourth root",
          },
        ],
      },
      {
        title: "Common Radicals",
        items: [
          {
            label: "Quadratic Formula",
            preview: "−b ± √(b²−4ac)\n────────────\n2a",
            value: "\\frac{-b \\pm \\sqrt{b^{2}-4ac}}{2a}",
            tooltip: "Quadratic formula",
            wide: true,
          },
          {
            label: "√(a²+b²)",
            value: "\\sqrt{a^{2}+b^{2}}",
            tooltip: "Pythagorean radical",
            wide: true,
          },
        ],
      },
    ],
  },

  {
    key: "Integral",
    label: "Integral",
    preview: "∫□",
    sections: [
      {
        title: "Integrals",
        items: [
          {
            label: "∫□",
            preview: "∫□",
            value: "\\int #? \\, d#?",
            tooltip: "Indefinite integral",
          },
          {
            label: "∫ₐᵇ□",
            preview: "∫ₐᵇ□",
            value: "\\int_{#?}^{#?} #? \\, d#?",
            tooltip: "Definite integral",
          },
          {
            label: "∬□",
            preview: "∬□",
            value: "\\iint #? \\, d#?\\,d#?",
            tooltip: "Double integral",
          },
          {
            label: "∬ᴰ□",
            preview: "∬ᴰ□",
            value: "\\iint_{#?} #? \\, d#?\\,d#?",
            tooltip: "Double integral over region",
          },
          {
            label: "∭□",
            preview: "∭□",
            value: "\\iiint #? \\, d#?\\,d#?\\,d#?",
            tooltip: "Triple integral",
          },
          {
            label: "∭ⱽ□",
            preview: "∭ⱽ□",
            value: "\\iiint_{#?} #? \\, d#?\\,d#?\\,d#?",
            tooltip: "Triple integral over volume",
          },
        ],
      },
      {
        title: "Contour Integrals",
        items: [
          {
            label: "∮□",
            preview: "∮□",
            value: "\\oint #? \\, d#?",
            tooltip: "Contour integral",
          },
          {
            label: "∮꜀□",
            preview: "∮꜀□",
            value: "\\oint_{#?} #? \\, d#?",
            tooltip: "Contour integral over curve",
          },
          {
            label: "∯□",
            preview: "∯□",
            value: "\\oiint #? \\, dS",
            tooltip: "Closed surface integral",
          },
          {
            label: "∯ₛ□",
            preview: "∯ₛ□",
            value: "\\oiint_{#?} #? \\, dS",
            tooltip: "Closed surface integral over surface",
          },
          {
            label: "∰□",
            preview: "∰□",
            value: "\\oiiint #? \\, dV",
            tooltip: "Closed volume integral",
          },
          {
            label: "∰ᵥ□",
            preview: "∰ᵥ□",
            value: "\\oiiint_{#?} #? \\, dV",
            tooltip: "Closed volume integral over volume",
          },
        ],
      },
      {
        title: "Common Integrals",
        items: [
          {
            label: "∫f(x)dx",
            value: "\\int f(x)\\,dx",
            tooltip: "Common integral",
          },
          {
            label: "∫sin x dx",
            value: "\\int \\sin x\\,dx",
            tooltip: "Sine integral",
          },
          {
            label: "∫cos x dx",
            value: "\\int \\cos x\\,dx",
            tooltip: "Cosine integral",
          },
          {
            label: "∫eˣ dx",
            value: "\\int e^{x}\\,dx",
            tooltip: "Exponential integral",
          },
        ],
      },
    ],
  },

  {
    key: "LargeOperator",
    label: "Large Operator",
    preview: "∑□",
    sections: [
      {
        title: "Summations",
        items: [
          {
            label: "∑□",
            value: "\\sum #?",
            tooltip: "Summation",
          },
          {
            label: "∑ᵢ₌₀ⁿ□",
            value: "\\sum_{#?=#?}^{#?} #?",
            tooltip: "Summation with limits",
          },
          {
            label: "∑ᵢ□",
            value: "\\sum_{#?} #?",
            tooltip: "Summation with lower index",
          },
          {
            label: "∑ⁿ□",
            value: "\\sum^{#?} #?",
            tooltip: "Summation with upper index",
          },
        ],
      },
      {
        title: "Products and Co-Products",
        items: [
          {
            label: "∏□",
            value: "\\prod #?",
            tooltip: "Product",
          },
          {
            label: "∏ᵢ₌₀ⁿ□",
            value: "\\prod_{#?=#?}^{#?} #?",
            tooltip: "Product with limits",
          },
          {
            label: "∐□",
            value: "\\coprod #?",
            tooltip: "Co-product",
          },
          {
            label: "∐ᵢ₌₀ⁿ□",
            value: "\\coprod_{#?=#?}^{#?} #?",
            tooltip: "Co-product with limits",
          },
        ],
      },
      {
        title: "Common Large Operators",
        items: [
          {
            label: "∑ᵢ₌₁ⁿxᵢ",
            value: "\\sum_{i=1}^{n}x_i",
            tooltip: "Common summation",
          },
          {
            label: "∏ₖ₌₁ⁿAₖ",
            value: "\\prod_{k=1}^{n}A_k",
            tooltip: "Common product",
          },
          {
            label: "⋃Aᵢ",
            value: "\\bigcup_{i=1}^{n}A_i",
            tooltip: "Union of sets",
          },
          {
            label: "⋂Aᵢ",
            value: "\\bigcap_{i=1}^{n}A_i",
            tooltip: "Intersection of sets",
          },
        ],
      },
    ],
  },

  {
    key: "Bracket",
    label: "Bracket",
    preview: "(□)",
    sections: [
      {
        title: "Brackets",
        items: [
          {
            label: "(□)",
            value: "\\left( #? \\right)",
            tooltip: "Parentheses",
          },
          {
            label: "[□]",
            value: "\\left[ #? \\right]",
            tooltip: "Square brackets",
          },
          {
            label: "{□}",
            value: "\\left\\{ #? \\right\\}",
            tooltip: "Curly braces",
          },
          {
            label: "|□|",
            value: "\\left| #? \\right|",
            tooltip: "Absolute value",
          },
          {
            label: "‖□‖",
            value: "\\left\\| #? \\right\\|",
            tooltip: "Norm brackets",
          },
          {
            label: "⟨□⟩",
            value: "\\left\\langle #? \\right\\rangle",
            tooltip: "Angle brackets",
          },
        ],
      },
      {
        title: "Common Brackets",
        items: [
          {
            label: "(a+b)",
            value: "\\left(a+b\\right)",
            tooltip: "Parenthesized expression",
          },
          {
            label: "|x|",
            value: "\\left|x\\right|",
            tooltip: "Absolute value of x",
          },
          {
            label: "{x|x>0}",
            value: "\\left\\{x\\mid x>0\\right\\}",
            tooltip: "Set builder",
          },
          {
            label: "C(n,k)",
            value: "\\binom{n}{k}",
            tooltip: "Binomial coefficient",
          },
        ],
      },
    ],
  },

  {
    key: "Function",
    label: "Function",
    preview: "sin□",
    sections: [
      {
        title: "Trigonometric Functions",
        items: [
          {
            label: "sin□",
            value: "\\sin #?",
            tooltip: "Sine",
          },
          {
            label: "cos□",
            value: "\\cos #?",
            tooltip: "Cosine",
          },
          {
            label: "tan□",
            value: "\\tan #?",
            tooltip: "Tangent",
          },
          {
            label: "csc□",
            value: "\\csc #?",
            tooltip: "Cosecant",
          },
          {
            label: "sec□",
            value: "\\sec #?",
            tooltip: "Secant",
          },
          {
            label: "cot□",
            value: "\\cot #?",
            tooltip: "Cotangent",
          },
        ],
      },
      {
        title: "Common Functions",
        items: [
          {
            label: "sinθ",
            value: "\\sin\\theta",
            tooltip: "Sine theta",
          },
          {
            label: "cosθ",
            value: "\\cos\\theta",
            tooltip: "Cosine theta",
          },
          {
            label: "tanθ",
            value: "\\tan\\theta",
            tooltip: "Tangent theta",
          },
          {
            label: "log x",
            value: "\\log x",
            tooltip: "Common logarithm",
          },
          {
            label: "ln x",
            value: "\\ln x",
            tooltip: "Natural logarithm",
          },
          {
            label: "eˣ",
            value: "e^{x}",
            tooltip: "Exponential function",
          },
        ],
      },
    ],
  },

  {
    key: "Accent",
    label: "Accent",
    preview: "□̂",
    sections: [
      {
        title: "Accents",
        items: [
          {
            label: "□̂",
            preview: "□̂",
            value: "\\hat{#?}",
            tooltip: "Hat accent",
          },
          {
            label: "□̃",
            preview: "□̃",
            value: "\\tilde{#?}",
            tooltip: "Tilde accent",
          },
          {
            label: "□̄",
            preview: "□̄",
            value: "\\bar{#?}",
            tooltip: "Bar accent",
          },
          {
            label: "□⃗",
            preview: "□⃗",
            value: "\\vec{#?}",
            tooltip: "Vector accent",
          },
          {
            label: "□̇",
            preview: "□̇",
            value: "\\dot{#?}",
            tooltip: "Dot accent",
          },
          {
            label: "□̈",
            preview: "□̈",
            value: "\\ddot{#?}",
            tooltip: "Double dot accent",
          },
          {
            label: "□̌",
            preview: "□̌",
            value: "\\check{#?}",
            tooltip: "Check accent",
          },
          {
            label: "□́",
            preview: "□́",
            value: "\\acute{#?}",
            tooltip: "Acute accent",
          },
          {
            label: "□̀",
            preview: "□̀",
            value: "\\grave{#?}",
            tooltip: "Grave accent",
          },
          {
            label: "□̅",
            preview: "□̅",
            value: "\\overline{#?}",
            tooltip: "Overline",
          },
          {
            label: "□̲",
            preview: "□̲",
            value: "\\underline{#?}",
            tooltip: "Underline",
          },
        ],
      },
      {
        title: "Common Accents",
        items: [
          {
            label: "x̄",
            value: "\\bar{x}",
            tooltip: "x bar",
          },
          {
            label: "x̂",
            value: "\\hat{x}",
            tooltip: "x hat",
          },
          {
            label: "a⃗",
            value: "\\vec{a}",
            tooltip: "Vector a",
          },
          {
            label: "AB→",
            value: "\\overrightarrow{AB}",
            tooltip: "Vector AB",
          },
        ],
      },
    ],
  },

  {
    key: "LimitLog",
    label: "Limit and Log",
    preview: "lim",
    sections: [
      {
        title: "Limits",
        items: [
          {
            label: "lim□→□",
            value: "\\lim_{#?\\to #?} #?",
            tooltip: "Limit with blanks",
          },
          {
            label: "lim x→0",
            value: "\\lim_{x\\to 0} f(x)",
            tooltip: "Limit as x tends to zero",
          },
          {
            label: "lim x→∞",
            value: "\\lim_{x\\to \\infty} f(x)",
            tooltip: "Limit as x tends to infinity",
          },
          {
            label: "lim h→0",
            value: "\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}",
            tooltip: "Derivative first principle",
            wide: true,
          },
        ],
      },
      {
        title: "Logarithms",
        items: [
          {
            label: "logₐ□",
            value: "\\log_{#?} #?",
            tooltip: "Logarithm with blank base",
          },
          {
            label: "log x",
            value: "\\log x",
            tooltip: "Common logarithm",
          },
          {
            label: "ln x",
            value: "\\ln x",
            tooltip: "Natural logarithm",
          },
          {
            label: "log₂x",
            value: "\\log_{2}x",
            tooltip: "Log base two",
          },
        ],
      },
    ],
  },

  {
    key: "Derivative",
    label: "Derivative",
    preview: "d/dx",
    sections: [
      {
        title: "Derivatives",
        items: [
          {
            label: "d/d□",
            preview: "d\n──\nd□",
            value: "\\frac{d}{d#?}",
            tooltip: "Derivative with blank variable",
          },
          {
            label: "d□/d□",
            preview: "d□\n──\nd□",
            value: "\\frac{d#?}{d#?}",
            tooltip: "Derivative fraction with blanks",
          },
          {
            label: "d²/d□²",
            preview: "d²\n──\nd□²",
            value: "\\frac{d^{2}}{d#?^{2}}",
            tooltip: "Second derivative",
          },
          {
            label: "d²□/d□²",
            preview: "d²□\n──\nd□²",
            value: "\\frac{d^{2}#?}{d#?^{2}}",
            tooltip: "Second derivative of function",
          },
        ],
      },
      {
        title: "Common Derivatives",
        items: [
          {
            label: "dy/dx",
            value: "\\frac{dy}{dx}",
            tooltip: "dy by dx",
          },
          {
            label: "d²y/dx²",
            value: "\\frac{d^{2}y}{dx^{2}}",
            tooltip: "Second derivative",
          },
          {
            label: "∂y/∂x",
            value: "\\frac{\\partial y}{\\partial x}",
            tooltip: "Partial derivative",
          },
          {
            label: "∂²z/∂x∂y",
            value: "\\frac{\\partial^{2}z}{\\partial x\\partial y}",
            tooltip: "Mixed partial derivative",
          },
        ],
      },
    ],
  },

  {
    key: "Operator",
    label: "Operator",
    preview: "△",
    sections: [
      {
        title: "Basic Operators",
        items: [
          {
            label: ":=",
            value: ":=",
            tooltip: "Defined as",
          },
          {
            label: "==",
            value: "==",
            tooltip: "Double equal",
          },
          {
            label: "+=",
            value: "+=",
            tooltip: "Plus equals",
          },
          {
            label: "−=",
            value: "-=",
            tooltip: "Minus equals",
          },
          {
            label: "def=",
            value: "\\overset{\\mathrm{def}}{=}",
            tooltip: "Defined equal",
          },
          {
            label: "□ over =",
            value: "\\overset{#?}{=}",
            tooltip: "Equal with blank above",
          },
        ],
      },
      {
        title: "Arrow Operators",
        items: [
          {
            label: "□→□",
            value: "#? \\rightarrow #?",
            tooltip: "Right arrow expression",
          },
          {
            label: "□←□",
            value: "#? \\leftarrow #?",
            tooltip: "Left arrow expression",
          },
          {
            label: "□⇒□",
            value: "#? \\Rightarrow #?",
            tooltip: "Implication",
          },
          {
            label: "□⇔□",
            value: "#? \\Leftrightarrow #?",
            tooltip: "Equivalent relation",
          },
        ],
      },
    ],
  },

  {
  key: "Matrix",
  label: "Matrix",
  preview: "⎡□ □⎤\n⎣□ □⎦",
  sections: [
    {
      title: "Empty Matrices",
      items: [
        {
          label: "1×2",
          value: "\\begin{matrix} #? & #? \\end{matrix}",
          tooltip: "1 by 2 plain matrix",
        },
        {
          label: "2×1",
          value: "\\begin{matrix} #? \\\\ #? \\end{matrix}",
          tooltip: "2 by 1 plain matrix",
        },
        {
          label: "1×3",
          value: "\\begin{matrix} #? & #? & #? \\end{matrix}",
          tooltip: "1 by 3 plain matrix",
        },
        {
          label: "3×1",
          value: "\\begin{matrix} #? \\\\ #? \\\\ #? \\end{matrix}",
          tooltip: "3 by 1 plain matrix",
        },
        {
          label: "2×2",
          value: "\\begin{matrix} #? & #? \\\\ #? & #? \\end{matrix}",
          tooltip: "2 by 2 plain matrix",
        },
        {
          label: "2×3",
          value: "\\begin{matrix} #? & #? & #? \\\\ #? & #? & #? \\end{matrix}",
          tooltip: "2 by 3 plain matrix",
        },
        {
          label: "3×2",
          value: "\\begin{matrix} #? & #? \\\\ #? & #? \\\\ #? & #? \\end{matrix}",
          tooltip: "3 by 2 plain matrix",
        },
        {
          label: "3×3",
          value: "\\begin{matrix} #? & #? & #? \\\\ #? & #? & #? \\\\ #? & #? & #? \\end{matrix}",
          tooltip: "3 by 3 plain matrix",
        },
      ],
    },

    {
      title: "Matrices with Brackets",
      items: [
        {
          label: "(2×2)",
          value: "\\begin{pmatrix} #? & #? \\\\ #? & #? \\end{pmatrix}",
          tooltip: "2 by 2 parenthesis matrix",
        },
        {
          label: "[2×2]",
          value: "\\begin{bmatrix} #? & #? \\\\ #? & #? \\end{bmatrix}",
          tooltip: "2 by 2 square bracket matrix",
        },
        {
          label: "|2×2|",
          value: "\\begin{vmatrix} #? & #? \\\\ #? & #? \\end{vmatrix}",
          tooltip: "2 by 2 determinant matrix",
        },
        {
          label: "‖2×2‖",
          value: "\\begin{Vmatrix} #? & #? \\\\ #? & #? \\end{Vmatrix}",
          tooltip: "2 by 2 double determinant matrix",
        },
        {
          label: "(3×3)",
          value: "\\begin{pmatrix} #? & #? & #? \\\\ #? & #? & #? \\\\ #? & #? & #? \\end{pmatrix}",
          tooltip: "3 by 3 parenthesis matrix",
        },
        {
          label: "[3×3]",
          value: "\\begin{bmatrix} #? & #? & #? \\\\ #? & #? & #? \\\\ #? & #? & #? \\end{bmatrix}",
          tooltip: "3 by 3 square bracket matrix",
        },
      ],
    },

    {
      title: "Dots",
      items: [
        {
          label: "⋯",
          value: "\\cdots",
          tooltip: "Horizontal dots",
        },
        {
          label: "…",
          value: "\\ldots",
          tooltip: "Low dots",
        },
        {
          label: "⋮",
          value: "\\vdots",
          tooltip: "Vertical dots",
        },
        {
          label: "⋱",
          value: "\\ddots",
          tooltip: "Diagonal dots",
        },
        {
          label: "□ ⋯ □",
          value: "#? & \\cdots & #?",
          tooltip: "Row with horizontal dots",
        },
        {
          label: "□ ⋮ □",
          value: "\\begin{matrix} #? \\\\ \\vdots \\\\ #? \\end{matrix}",
          tooltip: "Column with vertical dots",
        },
      ],
    },

    {
      title: "Identity Matrices",
      items: [
        {
          label: "2×2 I",
          value: "\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}",
          tooltip: "2 by 2 identity matrix",
        },
        {
          label: "3×3 I",
          value: "\\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}",
          tooltip: "3 by 3 identity matrix",
        },
        {
          label: "diag 2",
          value: "\\begin{bmatrix} #? & 0 \\\\ 0 & #? \\end{bmatrix}",
          tooltip: "2 by 2 diagonal matrix",
        },
        {
          label: "diag 3",
          value: "\\begin{bmatrix} #? & 0 & 0 \\\\ 0 & #? & 0 \\\\ 0 & 0 & #? \\end{bmatrix}",
          tooltip: "3 by 3 diagonal matrix",
        },
      ],
    },

    {
      title: "Sparse Matrices",
      items: [
        {
          label: "Sparse [ ]",
          value:
            "\\begin{bmatrix} #? & \\cdots & #? \\\\ \\vdots & \\ddots & \\vdots \\\\ #? & \\cdots & #? \\end{bmatrix}",
          tooltip: "Sparse square bracket matrix",
        },
        {
          label: "Sparse ( )",
          value:
            "\\begin{pmatrix} #? & \\cdots & #? \\\\ \\vdots & \\ddots & \\vdots \\\\ #? & \\cdots & #? \\end{pmatrix}",
          tooltip: "Sparse parenthesis matrix",
        },
        {
          label: "Sparse plain",
          value:
            "\\begin{matrix} #? & \\cdots & #? \\\\ \\vdots & \\ddots & \\vdots \\\\ #? & \\cdots & #? \\end{matrix}",
          tooltip: "Sparse plain matrix",
        },
        {
          label: "Sparse I",
          value:
            "\\begin{bmatrix} #? & 0 & \\cdots & 0 \\\\ 0 & #? & \\cdots & 0 \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ 0 & 0 & \\cdots & #? \\end{bmatrix}",
          tooltip: "Sparse diagonal matrix",
        },
      ],
    },

    {
      title: "Vectors",
      items: [
        {
          label: "Column 2",
          value: "\\begin{pmatrix} #? \\\\ #? \\end{pmatrix}",
          tooltip: "2 element column vector",
        },
        {
          label: "Column 3",
          value: "\\begin{pmatrix} #? \\\\ #? \\\\ #? \\end{pmatrix}",
          tooltip: "3 element column vector",
        },
        {
          label: "Row 2",
          value: "\\begin{bmatrix} #? & #? \\end{bmatrix}",
          tooltip: "2 element row vector",
        },
        {
          label: "Row 3",
          value: "\\begin{bmatrix} #? & #? & #? \\end{bmatrix}",
          tooltip: "3 element row vector",
        },
      ],
    },

    {
      title: "Cases and Augmented",
      items: [
        {
          label: "Cases 2",
          value: "\\begin{cases} #?, & #? \\\\ #?, & #? \\end{cases}",
          tooltip: "Two line cases expression",
        },
        {
          label: "Cases 3",
          value: "\\begin{cases} #?, & #? \\\\ #?, & #? \\\\ #?, & #? \\end{cases}",
          tooltip: "Three line cases expression",
        },
        {
          label: "Aug 2×3",
          value: "\\left[\\begin{array}{cc|c} #? & #? & #? \\\\ #? & #? & #? \\end{array}\\right]",
          tooltip: "2 by 3 augmented matrix",
        },
        {
          label: "Aug 3×4",
          value: "\\left[\\begin{array}{ccc|c} #? & #? & #? & #? \\\\ #? & #? & #? & #? \\\\ #? & #? & #? & #? \\end{array}\\right]",
          tooltip: "3 by 4 augmented matrix",
        },
      ],
    },

    {
      title: "Common Matrices",
      items: [
        {
          label: "A",
          value: "A=\\begin{bmatrix} #? & #? \\\\ #? & #? \\end{bmatrix}",
          tooltip: "Matrix A",
        },
        {
          label: "det(A)",
          value: "\\det\\begin{bmatrix} #? & #? \\\\ #? & #? \\end{bmatrix}",
          tooltip: "Determinant of 2 by 2 matrix",
        },
        {
          label: "A⁻¹",
          value: "A^{-1}",
          tooltip: "Inverse matrix notation",
        },
        {
          label: "Aᵀ",
          value: "A^{T}",
          tooltip: "Transpose matrix notation",
        },
      ],
    },

    {
      title: "Custom Matrix",
      items: [
        {
          label: "Custom",
          action: "customMatrix",
          value: "customMatrix",
          tooltip: "Create custom matrix",
        },
      ],
    },
  ],
},
];

const getSymbolMenuByLabel = (label) => {
  return SYMBOL_RIBBON_MENUS.find((menu) => menu.label === label);
};


function AddEditTopicPage({
  page,
  selectedCourse,
  selectedSubject,
  selectedChapter,
  newTopic,
  setNewTopic,
  topicView,
  setTopicView,
  updateNewTopicTheory,
  updateNewTopicProblems,
  saveTopic,
  saveEditedTopic,
  setPage,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSymbolMenu, setSelectedSymbolMenu] = useState("Basic Math");
const [isSymbolMenuOpen, setIsSymbolMenuOpen] = useState(false);
const [activeStructureMenu, setActiveStructureMenu] = useState(null);
const ribbonHeaderRef = useRef(null);
const [structurePopupLeft, setStructurePopupLeft] = useState(0);
const [isSymbolsExpanded, setIsSymbolsExpanded] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
  isOpen: false,
  title: "",
  message: "",
  confirmText: "OK",
  cancelText: "Cancel",
  type: "info",
  showCancel: false,
  onConfirm: null,
});

const [showMatrixModal, setShowMatrixModal] = useState(false);
const [matrixRows, setMatrixRows] = useState(2);
const [matrixCols, setMatrixCols] = useState(2);
const [matrixType, setMatrixType] = useState("bmatrix");

const showInfoModal = ({
  title = "Information",
  message = "",
  type = "info",
  confirmText = "OK",
}) => {
  setConfirmModal({
    isOpen: true,
    title,
    message,
    confirmText,
    cancelText: "Cancel",
    type,
    showCancel: false,
    onConfirm: null,
  });
};

const closeConfirmModal = () => {
  setConfirmModal((prev) => ({
    ...prev,
    isOpen: false,
    onConfirm: null,
  }));
};

const currentSymbolMenu =
  getSymbolMenuByLabel(selectedSymbolMenu) || SYMBOL_RIBBON_MENUS[0];

const currentSymbolSections = currentSymbolMenu.sections || [];

const activeStructureData =
  STRUCTURE_RIBBON_MENUS.find((menu) => menu.key === activeStructureMenu) ||
  null;

const toggleStructureMenu = (event, menuKey) => {
  setIsSymbolMenuOpen(false);

  const headerRect = ribbonHeaderRef.current?.getBoundingClientRect();
  const buttonRect = event.currentTarget.getBoundingClientRect();

  if (headerRect) {
    const popupWidth = 460;
    const rawLeft = buttonRect.left - headerRect.left;
    const safeLeft = Math.max(
      0,
      Math.min(rawLeft, headerRect.width - popupWidth - 20)
    );

    setStructurePopupLeft(safeLeft);
  }

  setActiveStructureMenu((prev) => (prev === menuKey ? null : menuKey));
};

  const isEditMode = page === "editTopic" && newTopic;
  const currentDocumentType = topicView === "theory" ? "theory" : "problem";

  const uploadedDocuments =
    topicView === "theory"
      ? newTopic.theoryDocuments || []
      : newTopic.problemDocuments || [];

  const insertIntoFocusedField = (text) => {
  const latexText = normalizeRibbonLatex(text);

  if (!latexText) return;

  if (window.__activeMathEditorInsertLatex) {
    window.__activeMathEditorInsertLatex(latexText);
    return;
  }

  const firstEditor = document.querySelector(".mixed-text-math-editor");

  if (firstEditor) {
    firstEditor.focus();

    setTimeout(() => {
      if (window.__activeMathEditorInsertLatex) {
        window.__activeMathEditorInsertLatex(latexText);
      } else {
        showInfoModal({
          title: "Select Editor",
          message: "Please click inside any MathEditor area first.",
          type: "info",
        });
      }
    }, 80);

    return;
  }

  const activeElement = document.activeElement;

  if (!activeElement) {
    showInfoModal({
      title: "Select Editor",
      message: "Please click inside any MathEditor area first.",
      type: "info",
    });
    return;
  }

  const tagName = activeElement.tagName?.toLowerCase();

  if (tagName === "textarea" || tagName === "input") {
    const start = activeElement.selectionStart ?? activeElement.value.length;
    const end = activeElement.selectionEnd ?? activeElement.value.length;
    const oldValue = activeElement.value || "";

    const updatedValue =
      oldValue.slice(0, start) + latexText + oldValue.slice(end);

    const textAreaSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    const inputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;

    const setter = tagName === "textarea" ? textAreaSetter : inputSetter;

    if (setter) {
      setter.call(activeElement, updatedValue);
    } else {
      activeElement.value = updatedValue;
    }

    activeElement.dispatchEvent(new Event("input", { bubbles: true }));
    activeElement.focus();

    const cursorPosition = start + latexText.length;

    setTimeout(() => {
      activeElement.setSelectionRange?.(cursorPosition, cursorPosition);
    }, 0);

    return;
  }

  if (tagName === "math-field") {
    try {
      activeElement.virtualKeyboardMode = "off";
      activeElement.setAttribute("virtual-keyboard-mode", "off");
      activeElement.setAttribute("virtual-keyboards", "none");

      if (typeof activeElement.executeCommand === "function") {
        activeElement.executeCommand(["insert", latexText]);
      } else if (typeof activeElement.insert === "function") {
        activeElement.insert(latexText);
      } else {
        activeElement.value = `${activeElement.value || ""}${latexText}`;
      }

      activeElement.dispatchEvent(new Event("input", { bubbles: true }));
      activeElement.focus();
    } catch {
      activeElement.value = `${activeElement.value || ""}${latexText}`;
      activeElement.dispatchEvent(new Event("input", { bubbles: true }));
    }

    return;
  }

  showInfoModal({
    title: "Select Editor",
    message: "Please click inside any MathEditor area first.",
    type: "info",
  });
};

  const insertNewEquation = () => {
  if (window.__activeMathEditorNewEquation) {
    window.__activeMathEditorNewEquation();
    return;
  }

  const firstEditor = document.querySelector(".mixed-text-math-editor");

  if (firstEditor) {
    firstEditor.focus();

    setTimeout(() => {
      if (window.__activeMathEditorNewEquation) {
        window.__activeMathEditorNewEquation();
      } else {
        showInfoModal({
          title: "Select Editor",
          message: "Please click inside any MathEditor area first.",
          type: "info",
        });
      }
    }, 80);

    return;
  }

  showInfoModal({
    title: "Select Editor",
    message: "Please click inside any MathEditor area first.",
    type: "info",
  });
};

  const insertImageIntoEditor = () => {
  if (window.__activeMathEditorInsertImage) {
    window.__activeMathEditorInsertImage();
    return;
  }

  const firstEditor = document.querySelector(".mixed-text-math-editor");

  if (firstEditor) {
    firstEditor.focus();

    setTimeout(() => {
      if (window.__activeMathEditorInsertImage) {
        window.__activeMathEditorInsertImage();
      } else {
        showInfoModal({
          title: "Select Editor",
          message: "Please click inside any MathEditor area first.",
          type: "info",
        });
      }
    }, 80);

    return;
  }

  showInfoModal({
    title: "Select Editor",
    message: "Please click inside any MathEditor area first.",
    type: "info",
  });
};

  const createMatrixLatex = (rows, cols, type = "bmatrix") => {
  const safeRows = Math.max(1, Math.min(Number(rows) || 2, 10));
  const safeCols = Math.max(1, Math.min(Number(cols) || 2, 10));

  const allowedTypes = [
    "matrix",
    "bmatrix",
    "pmatrix",
    "vmatrix",
    "Vmatrix",
    "cases",
  ];

  const safeType = allowedTypes.includes(type) ? type : "bmatrix";

  if (safeType === "cases") {
    const caseRows = Array.from({ length: safeRows }, () => {
      return "#?, & #?";
    }).join(" \\\\ ");

    return `\\begin{cases}${caseRows}\\end{cases}`;
  }

  const matrixBody = Array.from({ length: safeRows }, () => {
    return Array.from({ length: safeCols }, () => "#?").join(" & ");
  }).join(" \\\\ ");

  return `\\begin{${safeType}}${matrixBody}\\end{${safeType}}`;
};

  const insertCustomMatrix = () => {
  setMatrixRows(2);
  setMatrixCols(2);
  setMatrixType("bmatrix");
  setShowMatrixModal(true);
};

const confirmCustomMatrix = () => {
  const safeRows = Math.max(1, Math.min(Number(matrixRows) || 2, 10));
  const safeCols = Math.max(1, Math.min(Number(matrixCols) || 2, 10));

  const latex = createMatrixLatex(safeRows, safeCols, matrixType);
  insertIntoFocusedField(latex);
  setShowMatrixModal(false);
};

  const handleRibbonButtonClick = (item) => {
    if (!item) return;

    if (item.action === "customMatrix") {
      insertCustomMatrix();
      return;
    }

    if (item.value) {
      insertIntoFocusedField(item.value);
    }
  };

  const handleStructureSelect = (menuKey, item) => {
  handleRibbonButtonClick(item);
  setActiveStructureMenu(null);
};

  const handleDocumentUpload = (event, documentType) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const maxSize = 5 * 1024 * 1024;

    const oversizedFile = files.find((file) => file.size > maxSize);

    if (oversizedFile) {
      showInfoModal({
  title: "File Too Large",
  message: `${oversizedFile.name} is above 5 MB. Please upload files below 5 MB.`,
  type: "warning",
});
      event.target.value = "";
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        const newDocument = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          type: file.type,
          data: reader.result,
        };

        setNewTopic((prevTopic) => {
          if (documentType === "theory") {
            return {
              ...prevTopic,
              theoryDocuments: [
                ...(prevTopic.theoryDocuments || []),
                newDocument,
              ],
            };
          }

          return {
            ...prevTopic,
            problemDocuments: [
              ...(prevTopic.problemDocuments || []),
              newDocument,
            ],
          };
        });
      };

      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const removeDocument = (documentId, documentType) => {
    setNewTopic((prevTopic) => {
      if (documentType === "theory") {
        return {
          ...prevTopic,
          theoryDocuments: (prevTopic.theoryDocuments || []).filter(
            (document) =>
              (document.id || document._id || document.name) !== documentId
          ),
        };
      }

      return {
        ...prevTopic,
        problemDocuments: (prevTopic.problemDocuments || []).filter(
          (document) =>
            (document.id || document._id || document.name) !== documentId
        ),
      };
    });
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      if (isEditMode) {
        await saveEditedTopic();
      } else {
        await saveTopic();
      }
    } catch (error) {
      console.error("Topic save failed:", error);
      showInfoModal({
  title: "Save Failed",
  message: "Unable to save topic. Please try again.",
  type: "danger",
});
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToTopics = () => {
    if (isSaving) return;
    setPage("topics");
  };

  if (!newTopic) {
  return (
    <div className="topic-editor-page">
      <div className="topic-editor-card">
        <p className="small-label">Loading Topic</p>
        <h2>Please wait...</h2>
        <p>Topic content is loading after refresh.</p>
      </div>
    </div>
  );
}

  return (
    <div className="topic-editor-page">
      <div className="topic-editor-card">
        <div className="topic-editor-fixed-block">
          <div className="topic-breadcrumb-header">
            <div className="topic-breadcrumb-left">
              <p className="small-label">
                {isEditMode ? "Edit Topic" : "Add New Topic"}
              </p>

              <h1>
                {isEditMode
                  ? newTopic.topicName || "Edit Topic"
                  : "Add Topic"}
              </h1>

              <div className="topic-breadcrumb-path">
                <span>Dashboard</span>
                <span>/</span>
                <span>{selectedCourse?.courseName || "Course"}</span>
                <span>/</span>
                <span>{selectedSubject?.subjectName || "Subject"}</span>
                <span>/</span>
                <span>{selectedChapter?.chapterName || "Chapter"}</span>
                <span>/</span>
                <span>{isEditMode ? "Edit Topic" : "Add Topic"}</span>
              </div>
            </div>

            <button
              type="button"
              className="topic-header-back-btn"
              onClick={handleBackToTopics}
              disabled={isSaving}
            >
              ← Back
            </button>
          </div>

          <div
  ref={ribbonHeaderRef}
  className="topic-ribbon-header word-true-ribbon-header"
>
  <div className="word-ribbon-main-row">
    <div
  className={
    isSymbolsExpanded
      ? "word-ribbon-symbols-block symbols-expanded"
      : "word-ribbon-symbols-block"
  }
>
      <div className="word-ribbon-symbols-content">
        {currentSymbolSections.map((section) => (
          <div key={section.title} className="word-ribbon-symbol-section">
            {currentSymbolSections.length > 1 && (
              <h4 className="word-ribbon-symbol-section-title">{section.title}</h4>
            )}

            <div className="word-ribbon-symbol-grid">
              {section.buttons.map((item, index) => (
                <button
                  key={`${section.title}-${item.label}-${index}`}
                  type="button"
                  className="word-ribbon-symbol-btn"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleRibbonButtonClick(item)}
                  disabled={isSaving || !item.value}
                  title={getButtonTooltip(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <p className="word-ribbon-footer-title">Symbols</p>
      </div>

      <div className="word-ribbon-menu-side">
  <button
  type="button"
  className="symbol-expand-btn"
  onMouseDown={(event) => event.preventDefault()}
  onClick={() => setIsSymbolsExpanded((prev) => !prev)}
  title={isSymbolsExpanded ? "Collapse symbols panel" : "Expand symbols panel"}
>
  {isSymbolsExpanded ? "−" : "+"}
</button>

  <button
    type="button"
    className="word-ribbon-menu-side-btn"
    onMouseDown={(event) => event.preventDefault()}
    onClick={() => {
      setActiveStructureMenu(null);
      setIsSymbolMenuOpen((prev) => !prev);
    }}
  >
    <span>{selectedSymbolMenu}</span>
    <b>⌄</b>
  </button>

  {isSymbolMenuOpen && (
    <div className="word-ribbon-popup-menu">
      {SYMBOL_RIBBON_MENUS.map((menu) => (
        <button
          key={menu.label}
          type="button"
          className={
            selectedSymbolMenu === menu.label
              ? "word-ribbon-popup-item active"
              : "word-ribbon-popup-item"
          }
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setSelectedSymbolMenu(menu.label);
            setIsSymbolMenuOpen(false);
          }}
        >
          <span className="word-ribbon-popup-check">
            {selectedSymbolMenu === menu.label ? "✓" : ""}
          </span>
          <span>{menu.label}</span>
        </button>
      ))}
    </div>
  )}
</div>
    </div>

    <div className="word-ribbon-structures-panel">
  <div className="word-ribbon-structures-block">
    {STRUCTURE_RIBBON_MENUS.map((menu) => (
      <div key={menu.key} className="word-ribbon-structure-item">
        <button
          type="button"
          className="word-ribbon-structure-btn"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => toggleStructureMenu(event, menu.key)}
        >
          <div className="word-ribbon-structure-preview">
            {menu.preview}
          </div>

          <div className="word-ribbon-structure-label">
            <span>{menu.label}</span>
            <b>⌄</b>
          </div>
        </button>
      </div>
    ))}
  </div>

  <p className="word-ribbon-footer-title structures-footer-title">
    Structures
  </p>
</div>

{activeStructureData && (
  <div
    className="word-ribbon-floating-structure-popup"
    style={{ left: `${structurePopupLeft}px` }}
  >
    {activeStructureData.sections.map((section) => (
      <div key={section.title} className="word-ribbon-structure-section">
        <h4 className="word-ribbon-structure-section-title">
          {section.title}
        </h4>

        <div className="word-ribbon-structure-grid">
  {section.items.map((item, index) => (
    <button
      key={`${activeStructureData.key}-${section.title}-${item.label}-${index}`}
      type="button"
      className={`word-ribbon-structure-card ${item.wide ? "wide" : ""}`}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => handleStructureSelect(activeStructureData.key, item)}
      title={getButtonTooltip(item)}
    >
      <div className="word-ribbon-structure-card-preview">
        {item.preview || item.label}
      </div>
    </button>
  ))}
</div>
      </div>
    ))}
  </div>
)}
  </div>

  <div className="topic-ribbon-right">
    <button
      type="button"
      className="topic-ribbon-equation-btn"
      onMouseDown={(event) => event.preventDefault()}
      onClick={insertNewEquation}
      disabled={isSaving}
    >
      + Add Equation
    </button>

    <button
      type="button"
      className="topic-ribbon-image-btn"
      onMouseDown={(event) => event.preventDefault()}
      onClick={insertImageIntoEditor}
      disabled={isSaving}
    >
      + Add Image
    </button>
  </div>
</div>
        </div>


<div className="topic-editor-scroll-area">
  <div className="topic-name-box">
    <label>Topic Name</label>

    <input
      type="text"
      placeholder="Enter topic name"
      value={newTopic.topicName || ""}
      disabled={isSaving}
      onChange={(event) =>
        setNewTopic({
          ...newTopic,
          topicName: event.target.value,
        })
      }
    />
  </div>

  <div className="toggle-buttons">
    <button
      type="button"
      className={topicView === "theory" ? "active-toggle" : ""}
      onClick={() => setTopicView("theory")}
      disabled={isSaving}
    >
      Theory
    </button>

    <button
      type="button"
      className={topicView === "problems" ? "active-toggle" : ""}
      onClick={() => setTopicView("problems")}
      disabled={isSaving}
    >
      Problems
    </button>
  </div>

  <div className="document-upload-box">
    <label>
      {topicView === "theory"
        ? "Upload Theory Documents"
        : "Upload Problem Documents"}
    </label>

    <input
      type="file"
      multiple
      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
      disabled={isSaving}
      onChange={(event) =>
        handleDocumentUpload(event, currentDocumentType)
      }
    />

    {uploadedDocuments.length > 0 ? (
      <div className="uploaded-document-list">
        {uploadedDocuments.map((document) => {
          const documentKey = document.id || document._id || document.name;

          return (
            <div key={documentKey} className="uploaded-document-card">
              <div>
                <p>
                  {topicView === "theory"
                    ? "Theory Document"
                    : "Problem Document"}
                </p>

                <h4>{document.name}</h4>
              </div>

              <button
                type="button"
                onClick={() =>
                  removeDocument(documentKey, currentDocumentType)
                }
                disabled={isSaving}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="document-help-text">
        {topicView === "theory"
          ? "Upload documents related to theory. Each file should be below 5 MB."
          : "Upload documents related to problems. Each file should be below 5 MB."}
      </p>
    )}
  </div>

  {topicView === "theory" && (
    <div className="form-section single-math-section">
      <MathEditor
        label="Theory Matter"
        value={newTopic.theory?.matter || ""}
        placeholder="Example: Type theory matter here"
        onChange={(value) =>
          updateNewTopicTheory("matter", cleanEditorText(value))
        }
      />

      <MathEditor
        label="Theory Matter Explanation for AI Lecture"
        value={newTopic.theory?.matterExplanation || ""}
        placeholder="This explanation is hidden from students. AI will use this for voice explanation."
        onChange={(value) =>
          updateNewTopicTheory("matterExplanation", cleanEditorText(value))
        }
      />

      <MathEditor
        label="Example Problems with Solution"
        value={newTopic.theory?.examples || ""}
        placeholder="Example: Solve x^2 = 25"
        onChange={(value) =>
          updateNewTopicTheory("examples", cleanEditorText(value))
        }
      />

      <MathEditor
        label="Example Problems Explanation for AI Lecture"
        value={newTopic.theory?.examplesExplanation || ""}
        placeholder="Explain how AI should teach these examples. This is hidden from students."
        onChange={(value) =>
          updateNewTopicTheory(
            "examplesExplanation",
            cleanEditorText(value)
          )
        }
      />

      <MathEditor
        label="Mind Map"
        value={newTopic.theory?.mindMap || ""}
        placeholder="Example: Formula → Steps → Answer"
        onChange={(value) =>
          updateNewTopicTheory("mindMap", cleanEditorText(value))
        }
      />

      <MathEditor
        label="Mind Map Explanation for AI Lecture"
        value={newTopic.theory?.mindMapExplanation || ""}
        placeholder="Explain the mind map flow for AI voice. This is hidden from students."
        onChange={(value) =>
          updateNewTopicTheory(
            "mindMapExplanation",
            cleanEditorText(value)
          )
        }
      />
    </div>
  )}

  {topicView === "problems" && (
    <div className="form-section single-math-section">
      <MathEditor
        label="Questions"
        value={newTopic.problems?.questions || ""}
        placeholder="Example: Enter question here"
        onChange={(value) =>
          updateNewTopicProblems("questions", cleanEditorText(value))
        }
      />

      <MathEditor
        label="Questions Explanation for AI Lecture"
        value={newTopic.problems?.questionsExplanation || ""}
        placeholder="Explain how AI should introduce these questions. This is hidden from students."
        onChange={(value) =>
          updateNewTopicProblems(
            "questionsExplanation",
            cleanEditorText(value)
          )
        }
      />

      <MathEditor
        label="Solution"
        value={newTopic.problems?.solution || ""}
        placeholder="Example: Enter solution here"
        onChange={(value) =>
          updateNewTopicProblems("solution", cleanEditorText(value))
        }
      />

      <MathEditor
        label="Solution Explanation for AI Lecture"
        value={newTopic.problems?.solutionExplanation || ""}
        placeholder="Explain the solution steps for AI voice. This is hidden from students."
        onChange={(value) =>
          updateNewTopicProblems(
            "solutionExplanation",
            cleanEditorText(value)
          )
        }
      />

      <MathEditor
        label="Related Theory"
        value={newTopic.problems?.relatedTheory || ""}
        placeholder="Example: Enter related theory here"
        onChange={(value) =>
          updateNewTopicProblems("relatedTheory", cleanEditorText(value))
        }
      />

      <MathEditor
        label="Related Theory Explanation for AI Lecture"
        value={newTopic.problems?.relatedTheoryExplanation || ""}
        placeholder="Explain the related theory for AI voice. This is hidden from students."
        onChange={(value) =>
          updateNewTopicProblems(
            "relatedTheoryExplanation",
            cleanEditorText(value)
          )
        }
      />
    </div>
  )}

  <div className="save-row">
    <button
      type="button"
      className="cancel-btn"
      onClick={handleBackToTopics}
      disabled={isSaving}
    >
      Cancel
    </button>

    <button
      type="button"
      className="save-btn"
      onClick={handleSave}
      disabled={isSaving}
    >
      {isSaving
        ? isEditMode
          ? "Updating..."
          : "Saving..."
        : isEditMode
        ? "Update Topic"
        : "Save Topic"}
    </button>
  </div>
</div>
</div>

{showMatrixModal && (
  <div className="matrix-modal-overlay">
    <div className="matrix-modal-card">
      <div className="matrix-modal-header">
        <h3>Create Custom Matrix</h3>

        <button
          type="button"
          className="matrix-modal-close-btn"
          onClick={() => setShowMatrixModal(false)}
        >
          ×
        </button>
      </div>

      <div className="matrix-modal-body">
        <div className="matrix-input-row">
          <label>Rows</label>
          <input
            type="number"
            min="1"
            max="10"
            value={matrixRows}
            onChange={(event) => setMatrixRows(event.target.value)}
          />
        </div>

        <div className="matrix-input-row">
          <label>Columns</label>
          <input
            type="number"
            min="1"
            max="10"
            value={matrixCols}
            onChange={(event) => setMatrixCols(event.target.value)}
          />
        </div>

        <div className="matrix-input-row">
          <label>Matrix Type</label>
          <select
            value={matrixType}
            onChange={(event) => setMatrixType(event.target.value)}
          >
            <option value="bmatrix">Square brackets [ ]</option>
            <option value="pmatrix">Parentheses ( )</option>
            <option value="vmatrix">Determinant | |</option>
            <option value="Vmatrix">Double determinant ‖ ‖</option>
            <option value="matrix">No brackets</option>
            <option value="cases">Cases</option>
          </select>
        </div>

        <div className="matrix-preview-box">
          <p>Preview</p>
          <span>
            {matrixRows} × {matrixCols}{" "}
            {matrixType === "bmatrix"
              ? "square bracket matrix"
              : matrixType === "pmatrix"
              ? "parenthesis matrix"
              : matrixType === "vmatrix"
              ? "determinant matrix"
              : matrixType === "Vmatrix"
              ? "double determinant matrix"
              : matrixType === "cases"
              ? "cases expression"
              : "plain matrix"}
          </span>
        </div>
      </div>

      <div className="matrix-modal-footer">
        <button
          type="button"
          className="matrix-cancel-btn"
          onClick={() => setShowMatrixModal(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="matrix-insert-btn"
          onClick={confirmCustomMatrix}
        >
          Insert Matrix
        </button>
      </div>
    </div>
  </div>
)}

<ConfirmModal
  isOpen={confirmModal.isOpen}
  title={confirmModal.title}
  message={confirmModal.message}
  confirmText={confirmModal.confirmText}
  cancelText={confirmModal.cancelText}
  type={confirmModal.type}
  showCancel={confirmModal.showCancel}
  onConfirm={() => {
    if (typeof confirmModal.onConfirm === "function") {
      confirmModal.onConfirm();
    }
    closeConfirmModal();
  }}
  onCancel={closeConfirmModal}
/>
</div>
);
}

export default AddEditTopicPage;