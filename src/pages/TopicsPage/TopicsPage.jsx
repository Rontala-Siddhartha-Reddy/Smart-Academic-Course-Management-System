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

function TopicsPage({
  selectedCourse,
  selectedSubject,
  selectedChapter,
  setSelectedTopicId,
  setPage,
  openAddTopicPage,
  openEditTopicPage,
  topicImportRef,
  handleImportTopics,
  downloadExcelTemplate,
  hasPermission = () => false,
  deleteTopic,
  saveRecentlyOpened,
}) {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("topicsViewMode") || "cards";
  });

  const [searchText, setSearchText] = useState("");

  const topics = selectedChapter?.topics || [];

  const filteredTopics = useMemo(() => {
    const keyword = searchText.toLowerCase().trim();

    if (!keyword) return topics;

    return topics.filter((topic) =>
      String(topic.topicName || "").toLowerCase().includes(keyword)
    );
  }, [topics, searchText]);

  const changeViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem("topicsViewMode", mode);
  };

  const handleBackToChapters = () => {
    setSelectedTopicId(null);
    setPage("chapters");

    if (selectedSubject?.id) {
      navigate(`/subjects/${selectedSubject.id}/chapters`);
    }
  };

  const handleAddTopic = () => {
    if (!selectedChapter?.id) {
      alert("Please select a chapter first.");
      return;
    }

    openAddTopicPage(selectedChapter.id);
    navigate(`/chapters/${selectedChapter.id}/topics/add`);
  };

  const handleTopicClick = (topicId) => {
  if (!topicId) return;

  const topic = topics.find(
    (item) => item.id === topicId || item._id === topicId
  );

  const finalTopicId = topic?.id || topic?._id || topicId;

  if (topic && typeof saveRecentlyOpened === "function") {
    saveRecentlyOpened({
      id: finalTopicId,
      type: "topic",

      courseName: selectedCourse?.courseName || "Course",
      subjectName: selectedSubject?.subjectName || "Subject",
      chapterName: selectedChapter?.chapterName || "Chapter",
      topicName: topic.topicName || "Topic",

      title: topic.topicName || "Untitled Topic",
      path: `/topics/${finalTopicId}/view`,
    });
  }

  setSelectedTopicId(finalTopicId);
  setPage("viewTopic");
  navigate(`/topics/${finalTopicId}/view`);
};

  const handleDeleteTopic = (topic) => {
  if (!topic?.id) return;

  if (!deleteTopic) {
    alert("Delete function not connected. Please check App.jsx.");
    return;
  }

  deleteTopic(topic.id);
};

const handleEditTopic = (topic) => {
  const topicId = topic?.id || topic?._id;

  if (!topicId) return;

  setSelectedTopicId(topicId);

  if (typeof openEditTopicPage === "function") {
    openEditTopicPage(topic);
  } else {
    setPage("editTopic");
    navigate(`/topics/${topicId}/edit`);
  }
};

  const stopAndRun = (event, callback) => {
    event.preventDefault();
    event.stopPropagation();
    callback();
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="small-label">Selected Chapter</p>
          <h1>{selectedChapter?.chapterName || "Chapter"}</h1>
        </div>

        <div className="button-group">
          <button
            type="button"
            className="back-btn"
            onClick={handleBackToChapters}
          >
            ← Back
          </button>

          {hasPermission("canAddTopic") && (
            <button
              type="button"
              className="header-add-btn"
              onClick={handleAddTopic}
            >
              + Add Topic
            </button>
          )}

          {hasPermission("canImportTopic") && (
            <>
              <button
                type="button"
                className="import-btn"
                onClick={() => downloadExcelTemplate("topics")}
              >
                Download Template
              </button>

              <button
                type="button"
                className="import-btn"
                onClick={() => {
                  if (topicImportRef?.current) {
                    topicImportRef.current.click();
                  }
                }}
              >
                Upload Excel
              </button>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                ref={topicImportRef}
                className="hidden-input"
                onChange={handleImportTopics}
              />
            </>
          )}
        </div>
      </header>

      <section className="single-page-panel">
        <div className="panel-title-row">
          <div>
            <p className="small-label">Topics Page</p>
            <h2>Topics</h2>
          </div>

          <span className="count-badge">{topics.length}</span>
        </div>

        <div className="list-toolbar">
          <div className="list-search-box">
            <span className="toolbar-icon">
              <SearchIcon />
            </span>

            <input
              type="text"
              placeholder="Search topics..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <div className="view-toggle-box">
            <button
              type="button"
              className={viewMode === "cards" ? "active" : ""}
              onClick={(event) =>
                stopAndRun(event, () => changeViewMode("cards"))
              }
              title="Card view"
            >
              <CardViewIcon />
            </button>

            <button
              type="button"
              className={viewMode === "table" ? "active" : ""}
              onClick={(event) =>
                stopAndRun(event, () => changeViewMode("table"))
              }
              title="Table view"
            >
              <TableViewIcon />
            </button>
          </div>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="empty-box">No topics found.</div>
        ) : viewMode === "cards" ? (
          <div className="topic-page-grid topic-grid subject-grid">
            {filteredTopics.map((topic, index) => (
              <div key={topic.id || index} className="subject-card smart-card-style">
                <button
                  type="button"
                  className="card-main-click"
                  onClick={(event) =>
                    stopAndRun(event, () => handleTopicClick(topic.id))
                  }
                >
                  <div className="subject-icon">{index + 1}</div>

                  <h3>{topic.topicName}</h3>

                  <p>{selectedChapter?.chapterName || "Chapter"}</p>
                </button>

                <div className="card-action-row">
                  <button
                    type="button"
                    title="View"
                    onClick={(event) =>
                      stopAndRun(event, () => handleTopicClick(topic.id))
                    }
                  >
                    <ViewIcon />
                  </button>

                  {hasPermission("canEditTopic") && (
                    <button
                      type="button"
                      title="Edit"
                      onClick={(event) =>
                        stopAndRun(event, () => handleEditTopic(topic))
                      }
                    >
                      <EditIcon />
                    </button>
                  )}

                  {hasPermission("canRemoveTopic") && (
                    <button
                      type="button"
                      title="Delete"
                      className="delete"
                      onClick={(event) =>
                        stopAndRun(event, () => handleDeleteTopic(topic))
                      }
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
                  <th>Topic</th>
                  <th>Chapter</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
  {filteredTopics.map((topic, index) => (
    <tr
      key={topic.id || topic._id || index}
      className="clickable-row"
      onClick={() => handleTopicClick(topic.id || topic._id)}
    >
      <td>{index + 1}</td>
      <td>{topic.topicName}</td>
      <td>{selectedChapter?.chapterName || "Chapter"}</td>

      <td>
        <div className="table-action-row">
          <button
            type="button"
            title="View"
            onClick={(event) =>
              stopAndRun(event, () => handleTopicClick(topic.id || topic._id))
            }
          >
            <ViewIcon />
          </button>

          {hasPermission("canEditTopic") && (
            <button
              type="button"
              title="Edit"
              onClick={(event) =>
                stopAndRun(event, () => handleEditTopic(topic))
              }
            >
              <EditIcon />
            </button>
          )}

          {hasPermission("canRemoveTopic") && (
            <button
              type="button"
              title="Delete"
              className="delete"
              onClick={(event) =>
                stopAndRun(event, () => handleDeleteTopic(topic))
              }
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

export default TopicsPage;