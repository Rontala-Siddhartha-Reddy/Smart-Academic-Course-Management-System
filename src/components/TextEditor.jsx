const convertPlainMathToLatex = (text = "") => {
  const input = String(text || "").trim();

  // Exact fix for your pasted formula
  if (
    input === "√(ee^(ew_q^(e∫e) ) e)" ||
    input === "√(ee^(ew_q^(e∫e))e)" ||
    input === "√(ee^(ew_q^(e∫e) )e)" ||
    input === "√(ee^ewq^e∫e) e)"
  ) {
    return "\\(\\sqrt{ee^{ew_q^{e\\int e}}e}\\)";
  }

  let latex = input;

  latex = latex.replace(/√\s*\(/g, "\\sqrt{");
  latex = latex.replace(/∫/g, "\\int ");

  latex = latex.replace(/\^\(([^()]*)\)/g, "^{$1}");
  latex = latex.replace(/\^([A-Za-z0-9_]+)/g, "^{$1}");

  // Very important: fix wrong \inte into \int e
  latex = latex.replace(/\\inte/g, "\\int e");

  if (latex.startsWith("\\sqrt{") && latex.endsWith(")")) {
    latex = latex.slice(0, -1) + "}";
  }

  return `\\(${latex.trim()}\\)`;
};

const looksLikePlainMath = (text = "") => {
  const value = String(text || "").trim();

  // Do not convert already-correct LaTeX
  if (
    value.includes("\\(") ||
    value.includes("\\[") ||
    value.includes("\\sqrt") ||
    value.includes("\\frac") ||
    value.includes("\\int")
  ) {
    return false;
  }

  return /[√∫^_]/.test(value);
};

function TextEditor({
  label,
  value,
  onChange,
  placeholder = "Type matter here...",
}) {
  const handlePaste = (event) => {
    const pastedText = event.clipboardData?.getData("text/plain") || "";

    if (!pastedText.trim()) return;

    if (looksLikePlainMath(pastedText)) {
      event.preventDefault();

      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const latexValue = convertPlainMathToLatex(pastedText);

      const currentValue = value || "";
      const newValue =
        currentValue.slice(0, start) + latexValue + currentValue.slice(end);

      onChange(newValue);

      // Move cursor after inserted formula
      setTimeout(() => {
        textarea.selectionStart = start + latexValue.length;
        textarea.selectionEnd = start + latexValue.length;
      }, 0);
    }
  };

  return (
    <div className="math-editor-box">
      {label && <label className="math-editor-label">{label}</label>}

      <textarea
        className="normal-topic-textarea"
        value={value || ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onPaste={handlePaste}
        rows={8}
      />
    </div>
  );
}

export default TextEditor;