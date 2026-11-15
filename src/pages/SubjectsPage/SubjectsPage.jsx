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

function SubjectsPage({
  selectedCourse,
  setSelectedSubjectId,
  setSelectedChapterId,
  setSelectedTopicId,
  setPage,
  handleAddSubject,
  subjectImportRef,
  handleImportSubjects,
  downloadExcelTemplate,
  hasPermission = () => false,
  deleteSubject,
  editSubject,
}) {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState(() => {
  return localStorage.getItem("subjectsViewMode") || "cards";
});

const changeViewMode = (mode) => {
  setViewMode(mode);
  localStorage.setItem("subjectsViewMode", mode);
};
  const [searchText, setSearchText] = useState("");

  const subjects = selectedCourse?.subjects || [];

  const filteredSubjects = useMemo(() => {
    const keyword = searchText.toLowerCase().trim();

    if (!keyword) return subjects;

    return subjects.filter((subject) =>
      subject.subjectName?.toLowerCase().includes(keyword)
    );
  }, [subjects, searchText]);

  const handleSubjectClick = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setSelectedChapterId(null);
    setSelectedTopicId(null);
    setPage("chapters");

    navigate(`/subjects/${subjectId}/chapters`);
  };

  const handleEditSubject = (subject) => {
  if (!editSubject) {
    alert("Edit function not connected.");
    return;
  }

  editSubject(subject);
};

  const handleDeleteSubject = (subject) => {
  if (!deleteSubject) {
    alert("Delete function not connected. We will connect it later in App.jsx.");
    return;
  }

  deleteSubject(subject.id);
};

  return (
    <>
      <header className="page-header">
        <div>
          <p className="small-label">Selected Course</p>
          <h1>{selectedCourse?.courseName || "Course"}</h1>
        </div>

        <div className="button-group">
          {hasPermission("canAddSubject") && (
            <button
              type="button"
              className="header-add-btn"
              onClick={handleAddSubject}
            >
              + Add Subject
            </button>
          )}

          {hasPermission("canImportSubject") && (
            <>
              <button
                type="button"
                className="import-btn"
                onClick={() => downloadExcelTemplate("subjects")}
              >
                Download Template
              </button>

              <button
                type="button"
                className="import-btn"
                onClick={() => subjectImportRef.current.click()}
              >
                Upload Excel
              </button>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                ref={subjectImportRef}
                className="hidden-input"
                onChange={handleImportSubjects}
              />
            </>
          )}
        </div>
      </header>

      <section className="single-page-panel">
        <div className="panel-title-row">
          <div>
            <p className="small-label">Subjects Page</p>
            <h2>Subjects</h2>
          </div>

          <span className="count-badge">{subjects.length}</span>
        </div>

        <div className="list-toolbar">
          <div className="list-search-box">
            <span className="toolbar-icon">
              <SearchIcon />
            </span>

            <input
              type="text"
              placeholder="Search subjects..."
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

        {filteredSubjects.length === 0 ? (
          <div className="empty-box">No subjects found.</div>
        ) : viewMode === "cards" ? (
          <div className="subject-grid">
            {filteredSubjects.map((subject) => (
              <div key={subject.id} className="subject-card smart-card-style">
                <button
                  type="button"
                  className="card-main-click"
                  onClick={() => handleSubjectClick(subject.id)}
                >
                  <div className="subject-icon">
                    {subject.subjectName?.charAt(0) || "S"}
                  </div>

                  <h3>{subject.subjectName}</h3>

                  <p>{subject.chapters?.length || 0} chapters</p>
                </button>

                <div className="card-action-row">
                  <button
                    type="button"
                    title="View"
                    onClick={() => handleSubjectClick(subject.id)}
                  >
                    <ViewIcon />
                  </button>

                  {hasPermission("canEditSubject") && (
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => handleEditSubject(subject)}
                    >
                      <EditIcon />
                    </button>
                  )}

                  {hasPermission("canRemoveSubject") && (
                    <button
                      type="button"
                      title="Delete"
                      className="delete"
                      onClick={() => handleDeleteSubject(subject)}
                    >
                      <DeleteIcon />
                    </button>
                  )}
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
                  <th>Subject</th>
                  <th>No. of Chapters</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubjects.map((subject, index) => (
                  <tr key={subject.id}>
                    <td>{index + 1}</td>
                    <td>{subject.subjectName}</td>
                    <td>{subject.chapters?.length || 0}</td>
                    <td>
                      <div className="table-action-row">
                        <button
                          type="button"
                          title="View"
                          onClick={() => handleSubjectClick(subject.id)}
                        >
                          <ViewIcon />
                        </button>

                        {hasPermission("canEditSubject") && (
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => handleEditSubject(subject)}
                          >
                            <EditIcon />
                          </button>
                        )}

                        {hasPermission("canRemoveSubject") && (
                          <button
                            type="button"
                            title="Delete"
                            className="delete"
                            onClick={() => handleDeleteSubject(subject)}
                          >
                            <DeleteIcon />
                          </button>
                        )}
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

export default SubjectsPage;