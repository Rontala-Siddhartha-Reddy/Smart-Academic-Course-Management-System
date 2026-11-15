import { useMemo, useState } from "react";

function SmartListView({
  title,
  subtitle,
  searchPlaceholder = "Search...",
  items = [],
  columns = [],
  getSearchText,
  onView,
  onEdit,
  onDelete,
  addButton,
  importButtons,
}) {
  const [viewMode, setViewMode] = useState("cards");
  const [searchText, setSearchText] = useState("");

  const filteredItems = useMemo(() => {
    const keyword = searchText.toLowerCase().trim();

    if (!keyword) return items;

    return items.filter((item) => {
      const value = getSearchText ? getSearchText(item) : JSON.stringify(item);
      return String(value).toLowerCase().includes(keyword);
    });
  }, [items, searchText, getSearchText]);

  return (
    <div className="smart-list-page">
      <div className="smart-list-header">
        <div>
          <p className="smart-small-title">Management</p>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className="smart-header-actions">
          {addButton}
          {importButtons}
        </div>
      </div>

      <div className="smart-toolbar">
        <div className="smart-search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        <div className="smart-view-toggle">
          <button
            type="button"
            className={viewMode === "cards" ? "active" : ""}
            onClick={() => setViewMode("cards")}
            title="Card view"
          >
            ▦
          </button>

          <button
            type="button"
            className={viewMode === "table" ? "active" : ""}
            onClick={() => setViewMode("table")}
            title="Table view"
          >
            ☰
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="smart-empty-box">No records found.</div>
      ) : viewMode === "cards" ? (
        <div className="smart-card-grid">
          {filteredItems.map((item, index) => (
            <div className="smart-card" key={item.id || item._id || index}>
              <div className="smart-card-top">
                <div className="smart-card-icon">
                  {columns[0]?.render
                    ? String(columns[0].render(item, index)).charAt(0)
                    : "D"}
                </div>

                <div>
                  <h3>{columns[0]?.render(item, index)}</h3>
                  {columns[1] && <p>{columns[1].render(item, index)}</p>}
                </div>
              </div>

              <div className="smart-card-meta">
                {columns.slice(2).map((column) => (
                  <div key={column.key}>
                    <span>{column.label}</span>
                    <strong>{column.render(item, index)}</strong>
                  </div>
                ))}
              </div>

              <div className="smart-actions">
                {onView && (
                  <button type="button" title="View" onClick={() => onView(item)}>
                    👁
                  </button>
                )}

                {onEdit && (
                  <button type="button" title="Edit" onClick={() => onEdit(item)}>
                    ✏️
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    title="Delete"
                    className="delete"
                    onClick={() => onDelete(item)}
                  >
                    🗑
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
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id || item._id || index}>
                  <td>{index + 1}</td>

                  {columns.map((column) => (
                    <td key={column.key}>{column.render(item, index)}</td>
                  ))}

                  <td>
                    <div className="smart-table-actions">
                      {onView && (
                        <button
                          type="button"
                          title="View"
                          onClick={() => onView(item)}
                        >
                          👁
                        </button>
                      )}

                      {onEdit && (
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => onEdit(item)}
                        >
                          ✏️
                        </button>
                      )}

                      {onDelete && (
                        <button
                          type="button"
                          title="Delete"
                          className="delete"
                          onClick={() => onDelete(item)}
                        >
                          🗑
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
    </div>
  );
}

export default SmartListView;