import MathDisplay from "../../components/MathDisplay";
import AiTopicLecturePlayer from "../../components/AiTopicLecturePlayer";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const cleanTopicText = (text = "") => {
  if (!text) return "";

  let cleaned = String(text);

  cleaned = cleaned.replace(/^\\displaylines\s*\{/i, "");
  cleaned = cleaned.replace(/^displaylines\s*\{/i, "");
  cleaned = cleaned.replace(/^displaylines/i, "");
  cleaned = cleaned.replace(/\\displaylines\s*/gi, "");
  cleaned = cleaned.replace(/\bdisplaylines\b/gi, "");

  cleaned = cleaned.replace(/\\textasciicircum\s*/gi, "^");
  cleaned = cleaned.replace(/textasciicircum/gi, "^");

  cleaned = cleaned.replace(/\n\s*\}\s*$/g, "");
  cleaned = cleaned.replace(/^\{\s*\n/g, "");

  cleaned = cleaned.replace(/\\\(\s*\\\)/g, "");
  cleaned = cleaned.replace(/\\\[\s*\\\]/g, "");

  return cleaned.trim();
};

function SafeTopicContentDisplay({ value, emptyText }) {
  const cleanedValue = cleanTopicText(value);

  if (!cleanedValue || cleanedValue.trim() === "") {
    return <p className="empty-text">{emptyText}</p>;
  }

  return (
    <div className="readonly-content-wrapper">
      <MathDisplay value={cleanedValue} />
    </div>
  );
}

function DocumentPreviewModal({ previewDocument, onClose }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!previewDocument) {
      setPreviewUrl("");
      return;
    }

    const fileData = previewDocument.data || previewDocument.fileData || "";

    if (!fileData) {
      setPreviewUrl("");
      return;
    }

    if (!fileData.startsWith("data:")) {
      setPreviewUrl(fileData);
      return;
    }

    try {
      const parts = fileData.split(",");
      const header = parts[0];
      const base64Data = parts[1];

      if (!base64Data) {
        setPreviewUrl(fileData);
        return;
      }

      const mimeMatch = header.match(/data:(.*?);base64/);
      const mimeType =
        mimeMatch?.[1] ||
        previewDocument.type ||
        previewDocument.mimeType ||
        "application/octet-stream";

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      setPreviewUrl(blobUrl);

      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    } catch (error) {
      console.error("Document preview error:", error);
      setPreviewUrl(fileData);
    }
  }, [previewDocument]);

  if (!previewDocument) return null;

  const fileName = previewDocument.name || "Uploaded Document";
  const fileType =
    previewDocument.type ||
    previewDocument.mimeType ||
    previewDocument.documentType ||
    "";

  const fileData = previewDocument.data || previewDocument.fileData || "";

  const isImage = fileType.startsWith("image/");
  const isPdf =
    fileType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf") ||
    fileData.startsWith("data:application/pdf");

  const isText = fileType.startsWith("text/");

  return (
    <div className="document-preview-overlay">
      <div className="document-preview-modal">
        <div className="document-preview-header">
          <div>
            <p className="small-label">Document Preview</p>
            <h3>{fileName}</h3>
          </div>

          <button
            type="button"
            className="document-preview-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="document-preview-body">
          {isImage && (
            <img
              src={previewUrl || fileData}
              alt={fileName}
              className="document-preview-image"
            />
          )}

          {isPdf && previewUrl && (
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              title={fileName}
              className="document-preview-frame"
            />
          )}

          {isText && previewUrl && !isPdf && (
            <iframe
              src={previewUrl}
              title={fileName}
              className="document-preview-frame"
            />
          )}

          {!isImage && !isPdf && !isText && (
            <div className="document-preview-not-supported">
              <h3>Preview not available</h3>
              <p>Please download this document to view it.</p>

              <a href={previewUrl || fileData} download={fileName}>
                Download Document
              </a>
            </div>
          )}

          {isPdf && !previewUrl && (
            <div className="document-preview-not-supported">
              <h3>PDF loading...</h3>
              <p>Please wait while the PDF preview is prepared.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TopicViewPage({
  selectedChapter,
  selectedTopic,
  topicView,
  setTopicView,
  setPage,
  goBackToTopicsPage,
  openEditTopicPage,
  hasPermission,
  currentUser,
}) {
  const navigate = useNavigate();

  const [studentSelectedSection, setStudentSelectedSection] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);

  const isStudent = currentUser?.role === "student";

  useEffect(() => {
    setStudentSelectedSection(null);
    setPreviewDocument(null);
  }, [selectedTopic?.id, topicView]);

  useEffect(() => {
    if (!topicView) {
      setTopicView("theory");
    }
  }, [topicView, setTopicView]);

  const theoryDocuments = useMemo(() => {
    if (selectedTopic?.theoryDocuments?.length > 0) {
      return selectedTopic.theoryDocuments;
    }

    if (selectedTopic?.documents?.length > 0) {
      return selectedTopic.documents;
    }

    if (selectedTopic?.documentData) {
      return [
        {
          id: "old-document",
          name: selectedTopic.documentName || "Uploaded Document",
          type: selectedTopic.documentType || "",
          data: selectedTopic.documentData || "",
        },
      ];
    }

    return [];
  }, [selectedTopic]);

  const problemDocuments = useMemo(() => {
    return selectedTopic?.problemDocuments || [];
  }, [selectedTopic]);

  const topicDocuments =
    topicView === "theory" ? theoryDocuments : problemDocuments;

  const theorySections = useMemo(
    () => [
      {
        key: "theoryMatter",
        title: "Theory Matter",
        value: selectedTopic?.theory?.matter,
        emptyText: "No theory matter added yet.",
      },
      {
        key: "examples",
        title: "Example Problems with Solution",
        value: selectedTopic?.theory?.examples,
        emptyText: "No example problems added yet.",
      },
      {
        key: "mindMap",
        title: "Mind Map",
        value: selectedTopic?.theory?.mindMap,
        emptyText: "No mind map added yet.",
      },
    ],
    [selectedTopic]
  );

  const problemSections = useMemo(
    () => [
      {
        key: "questions",
        title: "Questions",
        value: selectedTopic?.problems?.questions,
        emptyText: "No questions added yet.",
      },
      {
        key: "solution",
        title: "Solution",
        value: selectedTopic?.problems?.solution,
        emptyText: "No solution added yet.",
      },
      {
        key: "relatedTheory",
        title: "Related Theory",
        value: selectedTopic?.problems?.relatedTheory,
        emptyText: "No related theory added yet.",
      },
    ],
    [selectedTopic]
  );

  const studentSections =
    topicView === "theory" ? theorySections : problemSections;

  const selectedStudentContent = studentSections.find(
    (section) => section.key === studentSelectedSection
  );

  const openDocumentInNewTab = (documentItem) => {
    const fileData = documentItem?.data || documentItem?.fileData;

    if (!fileData) {
  console.warn("No document uploaded.");
  return;
}

    setPreviewDocument({
      ...documentItem,
      data: fileData,
      type: documentItem.type || documentItem.mimeType || "",
    });
  };

  const handleBackToTopics = () => {
  setPreviewDocument(null);
  setStudentSelectedSection(null);

  if (typeof goBackToTopicsPage === "function") {
    goBackToTopicsPage();
    return;
  }

  setPage("topics");
};

  const handleEditTopic = () => {
  if (!selectedTopic?.id && !selectedTopic?._id) return;

  setPreviewDocument(null);

  if (typeof openEditTopicPage === "function") {
    openEditTopicPage(selectedTopic);
  }
};

  if (!selectedTopic) {
    return (
      <div className="add-topic-page">
        <div className="add-topic-card">
          <div className="add-topic-header">
            <div>
              <p className="small-label">Loading Topic</p>
              <h1>Please wait...</h1>
              <p className="sub-text">Topic content is loading.</p>
            </div>

            <button
              type="button"
              className="back-btn"
              onClick={handleBackToTopics}
            >
              ← Topics
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isStudent) {
    return (
      <div className="add-topic-page">
        <div className="add-topic-card">
          <div className="add-topic-header">
            <div>
              <p className="small-label">Student Topic View</p>
              <h1>{selectedTopic.topicName || "Topic"}</h1>
              <p className="sub-text">
                Select Theory, Problems, or AI Lecture.
              </p>
            </div>

            <button
  type="button"
  className="back-btn"
  onClick={
    studentSelectedSection
      ? () => setStudentSelectedSection(null)
      : handleBackToTopics
  }
>
  ← Back
</button>
          </div>

          {!studentSelectedSection && topicView !== "lectures" && (
            <>
              <div className="toggle-buttons student-toggle-buttons">
                <button
                  type="button"
                  className={topicView === "theory" ? "active-toggle" : ""}
                  onClick={() => setTopicView("theory")}
                >
                  Theory
                </button>

                <button
                  type="button"
                  className={topicView === "problems" ? "active-toggle" : ""}
                  onClick={() => setTopicView("problems")}
                >
                  Problems
                </button>

                <button
                  type="button"
                  className={topicView === "lectures" ? "active-toggle" : ""}
                  onClick={() => setTopicView("lectures")}
                >
                  AI Lecture
                </button>
              </div>

              <div className="student-topic-option-grid">
                {studentSections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    className="student-topic-option"
                    onClick={() => setStudentSelectedSection(section.key)}
                  >
                    <span>{section.title}</span>
                    <b>Open →</b>
                  </button>
                ))}

                {topicDocuments.length > 0 && (
                  <button
                    type="button"
                    className="student-topic-option document-option"
                    onClick={() => setStudentSelectedSection("documents")}
                  >
                    <span>
                      {topicView === "theory"
                        ? "Uploaded Theory Documents"
                        : "Uploaded Problem Documents"}
                      <small>{topicDocuments.length} document(s) available</small>
                    </span>
                    <b>Open →</b>
                  </button>
                )}
              </div>
            </>
          )}

          {topicView === "lectures" && !studentSelectedSection && (
            <>
              <div className="toggle-buttons student-toggle-buttons">
                <button
                  type="button"
                  className={topicView === "theory" ? "active-toggle" : ""}
                  onClick={() => setTopicView("theory")}
                >
                  Theory
                </button>

                <button
                  type="button"
                  className={topicView === "problems" ? "active-toggle" : ""}
                  onClick={() => setTopicView("problems")}
                >
                  Problems
                </button>

                <button
                  type="button"
                  className={topicView === "lectures" ? "active-toggle" : ""}
                  onClick={() => setTopicView("lectures")}
                >
                  AI Lecture
                </button>
              </div>

              <AiTopicLecturePlayer
                topic={selectedTopic}
                currentUser={currentUser}
              />
            </>
          )}

          {studentSelectedSection === "documents" && (
            <div className="student-single-content-page">
              <p className="small-label">Uploaded Documents</p>
              <h2>
                {topicView === "theory"
                  ? "All Uploaded Theory Documents"
                  : "All Uploaded Problem Documents"}
              </h2>

              <div className="topic-document-view-list student-document-list">
                {topicDocuments.map((documentItem) => (
                  <div
                    key={documentItem.id || documentItem._id || documentItem.name}
                    className="topic-document-view-card"
                  >
                    <div>
                      <p>Document</p>
                      <h4>{documentItem.name}</h4>
                    </div>

                    <div className="document-action-buttons">
                      <button
                        type="button"
                        onClick={() => openDocumentInNewTab(documentItem)}
                      >
                        View
                      </button>

                      <a
                        href={documentItem.data || documentItem.fileData}
                        download={documentItem.name || "topic-document"}
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {studentSelectedSection &&
            studentSelectedSection !== "documents" &&
            selectedStudentContent && (
              <div className="student-single-content-page">
                <p className="small-label">Selected Section</p>
                <h2>{selectedStudentContent.title}</h2>

                <div className="view-box student-view-box">
                  <SafeTopicContentDisplay
                    value={selectedStudentContent.value}
                    emptyText={selectedStudentContent.emptyText}
                  />
                </div>
              </div>
            )}

          <DocumentPreviewModal
            previewDocument={previewDocument}
            onClose={() => setPreviewDocument(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="add-topic-page">
      <div className="add-topic-card">
        <div className="add-topic-header">
          <div>
            <p className="small-label">View Topic Content</p>
            <h1>{selectedTopic.topicName || "Topic"}</h1>
            <p className="sub-text">
              View theory, problems, documents, and AI Lecture Mode.
            </p>
          </div>

          <button
            type="button"
            className="back-btn"
            onClick={handleBackToTopics}
          >
            ← Back
          </button>
        </div>

        <div className="view-topic-actions">
  <div className="toggle-buttons">
    <button
      type="button"
      className={topicView === "theory" ? "active-toggle" : ""}
      onClick={() => setTopicView("theory")}
    >
      Theory
    </button>

    <button
      type="button"
      className={topicView === "problems" ? "active-toggle" : ""}
      onClick={() => setTopicView("problems")}
    >
      Problems
    </button>

    <button
      type="button"
      className={topicView === "lectures" ? "active-toggle" : ""}
      onClick={() => setTopicView("lectures")}
    >
      Lecture
    </button>
  </div>

  {hasPermission("canEditTopic") && (
    <button
      type="button"
      className="header-add-btn"
      onClick={handleEditTopic}
    >
      Edit Topic
    </button>
  )}
</div>

        {topicView !== "lectures" && topicDocuments.length > 0 && (
          <div className="topic-document-view-list">
            <p className="small-label">
              {topicView === "theory" ? "Theory Documents" : "Problem Documents"}
            </p>

            {topicDocuments.map((documentItem) => (
              <div
                key={documentItem.id || documentItem._id || documentItem.name}
                className="topic-document-view-card"
              >
                <div>
                  <p>
                    {topicView === "theory"
                      ? "Theory Document"
                      : "Problem Document"}
                  </p>
                  <h4>{documentItem.name}</h4>
                </div>

                <div className="document-action-buttons">
                  <button
                    type="button"
                    onClick={() => openDocumentInNewTab(documentItem)}
                  >
                    View
                  </button>

                  <a
                    href={documentItem.data || documentItem.fileData}
                    download={documentItem.name || "topic-document"}
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {topicView === "theory" && (
          <div className="view-content-grid scrollable-topic-content">
            {theorySections.map((section) => (
              <div className="view-box scrollable-view-box" key={section.key}>
                <h3>{section.title}</h3>
                <SafeTopicContentDisplay
                  value={section.value}
                  emptyText={section.emptyText}
                />
              </div>
            ))}
          </div>
        )}

        {topicView === "problems" && (
          <div className="view-content-grid scrollable-topic-content">
            {problemSections.map((section) => (
              <div className="view-box scrollable-view-box" key={section.key}>
                <h3>{section.title}</h3>
                <SafeTopicContentDisplay
                  value={section.value}
                  emptyText={section.emptyText}
                />
              </div>
            ))}
          </div>
        )}

        {topicView === "lectures" && (
          <AiTopicLecturePlayer topic={selectedTopic} currentUser={currentUser} />
        )}

        <DocumentPreviewModal
          previewDocument={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      </div>
    </div>
  );
}

export default TopicViewPage;