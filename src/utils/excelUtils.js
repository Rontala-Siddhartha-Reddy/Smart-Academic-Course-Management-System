import * as XLSX from "xlsx";

export const readExcelFile = (file, callback) => {
  const reader = new FileReader();

  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    callback(rows);
  };

  reader.readAsArrayBuffer(file);
};

export const downloadExcelTemplate = (type) => {
  let headings = [];
  let fileName = "";

  if (type === "courses") {
    headings = ["courseName"];
    fileName = "course_import_template.xlsx";
  }

  if (type === "subjects") {
    headings = ["subjectName"];
    fileName = "subject_import_template.xlsx";
  }

  if (type === "chapters") {
    headings = ["chapterName"];
    fileName = "chapter_import_template.xlsx";
  }

  if (type === "topics") {
    headings = [
  "topicName",
  "theoryMatter",
  "explanation",
  "exampleProblemsWithSolution",
  "mindMap",
  "questions",
  "solution",
  "relatedTheory",
];

    fileName = "topic_import_template.xlsx";
  }

  const worksheet = XLSX.utils.aoa_to_sheet([headings]);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  XLSX.writeFile(workbook, fileName);
};