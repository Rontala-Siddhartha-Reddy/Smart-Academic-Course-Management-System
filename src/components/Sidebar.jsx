import { useNavigate } from "react-router-dom";

const DashboardIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CourseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const CollapseLeftIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

function Sidebar({
  courses,
  showCourses,
  setShowCourses,
  selectedCourseId,
  setSelectedCourseId,
  setSelectedSubjectId,
  setSelectedChapterId,
  setSelectedTopicId,
  setPage,
  handleAddCourse,
  courseImportRef,
  handleImportCourses,
  downloadExcelTemplate,
  currentUser,
  hasPermission = () => false,
  handleLogout,
  showUsers,
  setShowUsers,
  setUsersTab,
  sidebarCollapsed,
  setSidebarCollapsed,
}) {
  const navigate = useNavigate();

  const canOpenUsers =
    currentUser?.role === "admin" ||
    currentUser?.role === "subadmin" ||
    hasPermission("canViewUsers") ||
    hasPermission("canAddStudent") ||
    hasPermission("canRemoveStudent");

  const expandIfCollapsed = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      return true;
    }

    return false;
  };

  const handleCourseClick = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setSelectedTopicId(null);
    setPage("subjects");

    navigate(`/courses/${courseId}/subjects`);
  };

  const openUsersPage = (tabName) => {
    setUsersTab(tabName);
    setSelectedCourseId(null);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setSelectedTopicId(null);
    setPage("users");
    navigate("/users");
  };

  const openDashboard = () => {
    setShowUsers(false);
    setShowCourses(false);

    setSelectedCourseId(null);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setSelectedTopicId(null);

    setPage("dashboard");
    navigate("/");
  };

  const toggleUsers = () => {
    setShowCourses(false);
    setShowUsers(!showUsers);
  };

  const toggleCourses = () => {
    setShowUsers(false);
    setShowCourses(!showCourses);
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      <div>
        <div className="logo-box sidebar-logo-row">
          <button
            type="button"
            className="logo-left-area logo-click-btn"
            onClick={() => expandIfCollapsed()}
            title={sidebarCollapsed ? "Expand sidebar" : "Dashboard"}
          >
            <div className="logo-circle">CD</div>

            <div className="sidebar-brand-text">
              <h2>Dashboard</h2>
              <p>
                {currentUser?.role === "admin"
                  ? "Admin Panel"
                  : currentUser?.role === "subadmin"
                  ? "Sub Admin Panel"
                  : currentUser?.role === "teacher"
                  ? "Teacher Panel"
                  : "Student Panel"}
              </p>
            </div>
          </button>

          {!sidebarCollapsed && (
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setSidebarCollapsed(true)}
              title="Collapse sidebar"
            >
              <CollapseLeftIcon />
            </button>
          )}
        </div>

        <button
          type="button"
          className="main-menu-btn dashboard-main-btn"
          onClick={() => {
            if (expandIfCollapsed()) return;
            openDashboard();
          }}
          title="Dashboard"
        >
          <span className="sidebar-icon">
            <DashboardIcon />
          </span>

          <span className="sidebar-text">Dashboard</span>

          <span className="sidebar-arrow-placeholder"></span>
        </button>

        {canOpenUsers && (
          <div className="sidebar-section">
            <button
              type="button"
              className="main-menu-btn users-main-btn"
              onClick={() => {
                if (expandIfCollapsed()) return;
                toggleUsers();
              }}
              title="Users"
            >
              <span className="sidebar-icon">
                <UsersIcon />
              </span>

              <span className="sidebar-text">Users</span>

              {!sidebarCollapsed && (
                <span className="sidebar-arrow">{showUsers ? "▲" : "▼"}</span>
              )}
            </button>

            {!sidebarCollapsed && showUsers && (
              <div className="users-dropdown">
                {(currentUser?.role === "admin" ||
                  currentUser?.role === "subadmin") && (
                  <button type="button" onClick={() => openUsersPage("staff")}>
                    Staff Members
                  </button>
                )}

                <button type="button" onClick={() => openUsersPage("students")}>
                  Students
                </button>
              </div>
            )}
          </div>
        )}

        <div className="sidebar-section">
          <button
            type="button"
            className="main-menu-btn"
            onClick={() => {
              if (expandIfCollapsed()) return;
              toggleCourses();
            }}
            title="Courses"
          >
            <span className="sidebar-icon">
              <CourseIcon />
            </span>

            <span className="sidebar-text">Courses</span>

            {!sidebarCollapsed && (
              <span className="sidebar-arrow">{showCourses ? "▲" : "▼"}</span>
            )}
          </button>

          {!sidebarCollapsed && showCourses && (
            <div className="course-list">
              {courses.length === 0 ? (
                <div className="sidebar-empty-text">No assigned courses.</div>
              ) : (
                courses.map((course) => (
                  <button
                    type="button"
                    key={course.id}
                    className={
                      selectedCourseId === course.id
                        ? "course-btn active"
                        : "course-btn"
                    }
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <span className="course-number">
                      {course.courseName?.charAt(0) || "C"}
                    </span>
                    <span>{course.courseName}</span>
                  </button>
                ))
              )}

              {hasPermission("canAddCourse") && (
                <button
                  type="button"
                  className="add-course-btn"
                  onClick={handleAddCourse}
                >
                  + Add Course
                </button>
              )}

              {hasPermission("canImportCourse") && (
                <div className="import-box-sidebar">
                  <button
                    type="button"
                    className="import-btn-light"
                    onClick={() => downloadExcelTemplate("courses")}
                  >
                    Download Course Template
                  </button>

                  <button
                    type="button"
                    className="import-btn-light"
                    onClick={() => courseImportRef.current.click()}
                  >
                    Upload Course Excel
                  </button>
                </div>
              )}

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                ref={courseImportRef}
                className="hidden-input"
                onChange={handleImportCourses}
              />
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="logged-user-box">
          <p>Logged in as</p>
          <h4>{currentUser?.name}</h4>
          <span>{currentUser?.role}</span>
        </div>

        <button
          type="button"
          className="sidebar-logout-btn"
          onClick={() => {
            if (expandIfCollapsed()) return;
            handleLogout();
          }}
          title="Logout"
        >
          <span className="sidebar-icon">
            <LogoutIcon />
          </span>

          <span className="sidebar-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;