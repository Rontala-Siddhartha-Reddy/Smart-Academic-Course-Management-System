import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../components/SmartListView.css";

const ViewIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const DeleteIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const CardViewIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const TableViewIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M3 12h18" />
    <path d="M3 18h18" />
    <path d="M8 6v12" />
    <path d="M16 6v12" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

function ChaptersPage({
  selectedCourse,
  selectedSubject,
  setSelectedChapterId,
  setSelectedTopicId,
  setPage,
  handleAddChapter,
  chapterImportRef,
  handleImportChapters,
  downloadExcelTemplate,
  hasPermission = () => false,
  deleteChapter,
  editChapter,
}) {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState(() => {
  return localStorage.getItem("chaptersViewMode") || "cards";
});

const changeViewMode = (mode) => {
  setViewMode(mode);
  localStorage.setItem("chaptersViewMode", mode);
};
  const [searchText, setSearchText] = useState("");

  const chapters = selectedSubject?.chapters || [];

  const filteredChapters = useMemo(() => {
    const keyword = searchText.toLowerCase().trim();

    if (!keyword) return chapters;

    return chapters.filter((chapter) =>
      chapter.chapterName?.toLowerCase().includes(keyword)
    );
  }, [chapters, searchText]);

  const handleBackToSubjects = () => {
    setSelectedChapterId(null);
    setSelectedTopicId(null);
    setPage("subjects");

    if (selectedCourse?.id) {
      navigate(`/courses/${selectedCourse.id}/subjects`);
    }
  };

  const handleChapterClick = (chapterId) => {
    setSelectedChapterId(chapterId);
    setSelectedTopicId(null);
    setPage("topics");

    navigate(`/chapters/${chapterId}/topics`);
  };

  const handleEditChapter = (chapter) => {
  if (!editChapter) {
    alert("Edit function not connected.");
    return;
  }

  editChapter(chapter);
};

  const handleDeleteChapter = (chapter) => {
    if (!deleteChapter) {
      alert("Delete function not connected. We will connect it later in App.jsx.");
      return;
    }

    deleteChapter(chapter.id);
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="small-label">Selected Subject</p>
          <h1>{selectedSubject?.subjectName || "Subject"}</h1>
        </div>

        <div className="button-group">
          <button type="button" className="back-btn" onClick={handleBackToSubjects}>
            ← Back
          </button>

          {hasPermission("canAddChapter") && (
            <button
              type="button"
              className="header-add-btn"
              onClick={handleAddChapter}
            >
              + Chapter
            </button>
          )}

          {hasPermission("canImportChapter") && (
            <>
              <button
                type="button"
                className="import-btn"
                onClick={() => downloadExcelTemplate("chapters")}
              >
                Download Template
              </button>

              <button
                type="button"
                className="import-btn"
                onClick={() => chapterImportRef.current.click()}
              >
                Upload Excel
              </button>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                ref={chapterImportRef}
                className="hidden-input"
                onChange={handleImportChapters}
              />
            </>
          )}
        </div>
      </header>

      <section className="single-page-panel">
        <div className="panel-title-row">
          <div>
            <p className="small-label">Chapters Page</p>
            <h2>Chapters</h2>
          </div>

          <span className="count-badge">{chapters.length}</span>
        </div>

        <div className="list-toolbar">
          <div className="list-search-box">
            <span className="toolbar-icon">
              <SearchIcon />
            </span>

            <input
              type="text"
              placeholder="Search chapters..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <div className="view-toggle-box">
            <button
              type="button"
              className={viewMode === "cards" ? "active" : ""}
              onClick={() => changeViewMode("cards")}
              title="Card view"
            >
              <CardViewIcon />
            </button>

            <button
              type="button"
              className={viewMode === "table" ? "active" : ""}
              onClick={() => changeViewMode("table")}
              title="Table view"
            >
              <TableViewIcon />
            </button>
          </div>
        </div>

        {filteredChapters.length === 0 ? (
          <div className="empty-box">No chapters found.</div>
        ) : viewMode === "cards" ? (
          <div className="chapter-page-grid chapter-grid subject-grid">
  {filteredChapters.map((chapter, index) => (
    <div key={chapter.id} className="subject-card smart-card-style">
      <button
        type="button"
        className="card-main-click"
        onClick={() => handleChapterClick(chapter.id)}
      >
        <div className="subject-icon">
          {index + 1}
        </div>

        <h3>{chapter.chapterName}</h3>

        <p>{chapter.topics?.length || 0} topics</p>
      </button>

      <div className="card-action-row">
        <button
          type="button"
          title="View"
          onClick={() => handleChapterClick(chapter.id)}
        >
          <ViewIcon />
        </button>

        <button
          type="button"
          title="Edit"
          onClick={() => handleEditChapter(chapter)}
        >
          <EditIcon />
        </button>

        <button
          type="button"
          title="Delete"
          className="delete"
          onClick={() => handleDeleteChapter(chapter)}
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  ))}
</div>
        ) : (
          <div className="smart-table-wrapper">
            <table className="smart-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Chapter</th>
                  <th>No. of Topics</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredChapters.map((chapter, index) => (
                  <tr key={chapter.id}>
                    <td>{index + 1}</td>
                    <td>{chapter.chapterName}</td>
                    <td>{chapter.topics?.length || 0}</td>
                    <td>
                      <div className="table-action-row">
                        <button
                          type="button"
                          title="View"
                          onClick={() => handleChapterClick(chapter.id)}
                        >
                          <ViewIcon />
                        </button>

                        <button
                          type="button"
                          title="Edit"
                          onClick={() => handleEditChapter(chapter)}
                        >
                          <EditIcon />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          className="delete"
                          onClick={() => handleDeleteChapter(chapter)}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default ChaptersPage;