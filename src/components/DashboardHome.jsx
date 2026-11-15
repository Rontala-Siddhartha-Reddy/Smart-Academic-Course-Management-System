import { useMemo } from "react";

function DashboardHome({
  courses = [],
  users = [],
  currentUser,
  openRecentlyOpened,
}) {

  const getUniqueUsers = (userList = []) => {
    const uniqueMap = new Map();

    userList.forEach((user) => {
      const uniqueKey =
        user.email?.toLowerCase().trim() || user.id || user._id;

      if (!uniqueKey) return;

      if (!uniqueMap.has(uniqueKey)) {
        uniqueMap.set(uniqueKey, user);
      }
    });

    return Array.from(uniqueMap.values());
  };

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "subadmin";

  const isTeacher = currentUser?.role === "teacher";
  const isStudent = currentUser?.role === "student";

  const uniqueUsers = getUniqueUsers(users);

  const currentUserId = currentUser?.id || currentUser?._id || "guest";

  const recentlyOpened = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem(`recentlyOpened_${currentUserId}`) || "[]"
      );
    } catch {
      return [];
    }
  }, [currentUserId]);

  const handleRecentOpen = (item) => {
  if (typeof openRecentlyOpened === "function") {
    openRecentlyOpened(item);
  }
};

  const staffMembers = uniqueUsers.filter(
    (user) =>
      user.role === "admin" ||
      user.role === "subadmin" ||
      user.role === "teacher"
  );

  const students = uniqueUsers.filter((user) => user.role === "student");

  const recentStudents = [...students].slice(-10).reverse();
  const recentStaff = [...staffMembers].slice(-10).reverse();

  const totalSubjects = courses.reduce(
    (sum, course) => sum + (course.subjects?.length || 0),
    0
  );

  const totalChapters = courses.reduce((sum, course) => {
    return (
      sum +
      (course.subjects || []).reduce(
        (subjectSum, subject) =>
          subjectSum + (subject.chapters?.length || 0),
        0
      )
    );
  }, 0);

  const totalTopics = courses.reduce((sum, course) => {
    return (
      sum +
      (course.subjects || []).reduce((subjectSum, subject) => {
        return (
          subjectSum +
          (subject.chapters || []).reduce(
            (chapterSum, chapter) =>
              chapterSum + (chapter.topics?.length || 0),
            0
          )
        );
      }, 0)
    );
  }, 0);

  const cards = [
    {
      title: isAdmin ? "Courses" : "Assigned Courses",
      value: courses.length,
      label: isAdmin ? "Total courses" : "Available to you",
    },
    {
      title: "Subjects",
      value: totalSubjects,
      label: "Across courses",
    },
    {
      title: "Chapters",
      value: totalChapters,
      label: "Learning chapters",
    },
    {
      title: "Topics",
      value: totalTopics,
      label: "Topic contents",
    },
  ];

  if (isAdmin || isTeacher) {
    cards.push({
      title: "Students",
      value: students.length,
      label: isAdmin ? "Registered students" : "Student users",
    });
  }

  if (isAdmin) {
    cards.push({
      title: "Staff",
      value: staffMembers.length,
      label: "Admin / Sub Admin / Teachers",
    });
  }

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";

    try {
      return new Date(dateValue).toLocaleString();
    } catch {
      return "-";
    }
  };

  const renderRecentlyOpenedTable = () => {
  if (!recentlyOpened || recentlyOpened.length === 0) {
    return (
      <div className="dashboard-empty">
        No recently opened items yet.
      </div>
    );
  }

  return (
    <div className="dashboard-recent-table-wrapper">
      <table className="dashboard-recent-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Course</th>
            <th>Subject</th>
            <th>Chapter</th>
            <th>Topic</th>
            <th>Opened At</th>
          </tr>
        </thead>

        <tbody>
          {recentlyOpened.map((item, index) => (
            <tr
              key={`${item.type || "item"}-${item.id || index}`}
              onClick={() => handleRecentOpen(item)}
              className="dashboard-recent-click-row"
              title="Click to open"
            >
              <td>{index + 1}</td>

              <td>{item.courseName || "-"}</td>

              <td>{item.subjectName || "-"}</td>

              <td>{item.chapterName || "-"}</td>

              <td>{item.topicName || item.title || "-"}</td>

              <td>{formatDateTime(item.openedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

  return (
    <div className="dashboard-home">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-small-title">Dashboard Overview</p>

          <h1>
            {isAdmin && `Welcome back, ${currentUser?.name || "Admin"}`}
            {isTeacher && `Welcome back, ${currentUser?.name || "Teacher"}`}
            {isStudent && `Welcome back, ${currentUser?.name || "Student"}`}
          </h1>

          <p>
            {isAdmin &&
              "Summary of courses, staff members, students, learning content, and recent activity."}

            {isTeacher &&
              "Summary of assigned courses, learning content, and recent students."}

            {isStudent &&
              "Summary of your assigned courses and learning content."}
          </p>
        </div>

        <div className="dashboard-user-badge">
          <span>Logged in as</span>
          <strong>{currentUser?.role}</strong>
        </div>
      </div>

      <div className="dashboard-card-grid">
        {cards.map((card) => (
          <div className="dashboard-stat-card" key={card.title}>
            <p>{card.title}</p>
            <h2>{card.value}</h2>
            <span>{card.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-content-grid">
        {isAdmin && (
          <>
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <p>Recent Staff</p>
                <h3>Latest Staff Members</h3>
              </div>

              {recentStaff.length === 0 ? (
                <div className="dashboard-empty">
                  No staff members available.
                </div>
              ) : (
                <div className="dashboard-list dashboard-scroll-list">
                  {recentStaff.map((staff) => (
                    <div
                      className="dashboard-list-item"
                      key={staff.id || staff._id}
                    >
                      <div className="dashboard-item-icon">
                        {staff.name?.charAt(0) || "U"}
                      </div>

                      <div>
                        <h4>{staff.name || "Unnamed Staff"}</h4>
                        <p>
                          {staff.role} • {staff.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <p>Recent Students</p>
                <h3>Latest Students</h3>
              </div>

              {recentStudents.length === 0 ? (
                <div className="dashboard-empty">No students available.</div>
              ) : (
                <div className="dashboard-list dashboard-scroll-list">
                  {recentStudents.map((student) => (
                    <div
                      className="dashboard-list-item"
                      key={student.id || student._id}
                    >
                      <div className="dashboard-item-icon">
                        {student.name?.charAt(0) || "S"}
                      </div>

                      <div>
                        <h4>{student.name || "Unnamed Student"}</h4>
                        <p>{student.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {isTeacher && (
          <>
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <p>Recent History</p>
                <h3>Recently Opened</h3>
              </div>

              {renderRecentlyOpenedTable()}
            </div>

            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <p>Recent Students</p>
                <h3>Latest Students</h3>
              </div>

              {recentStudents.length === 0 ? (
                <div className="dashboard-empty">No students available.</div>
              ) : (
                <div className="dashboard-list dashboard-scroll-list">
                  {recentStudents.map((student) => (
                    <div
                      className="dashboard-list-item"
                      key={student.id || student._id}
                    >
                      <div className="dashboard-item-icon">
                        {student.name?.charAt(0) || "S"}
                      </div>

                      <div>
                        <h4>{student.name || "Unnamed Student"}</h4>
                        <p>{student.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!isTeacher && (
          <div className="dashboard-panel dashboard-wide-panel">
            <div className="dashboard-panel-header">
              <p>Recent History</p>
              <h3>Recently Opened</h3>
            </div>

            {renderRecentlyOpenedTable()}
          </div>
        )}
      </div>

      <div className="dashboard-footer-panel">
        <h3>Quick Summary</h3>

        <p>
          {isAdmin ? (
            <>
              Your dashboard currently has <strong>{courses.length}</strong>{" "}
              courses, <strong>{totalSubjects}</strong> subjects,{" "}
              <strong>{totalChapters}</strong> chapters,{" "}
              <strong>{totalTopics}</strong> topics,{" "}
              <strong>{staffMembers.length}</strong> staff members, and{" "}
              <strong>{students.length}</strong> students.
            </>
          ) : isTeacher ? (
            <>
              Your teacher account currently has access to{" "}
              <strong>{courses.length}</strong> assigned courses,{" "}
              <strong>{totalSubjects}</strong> subjects,{" "}
              <strong>{totalChapters}</strong> chapters,{" "}
              <strong>{totalTopics}</strong> topics, and{" "}
              <strong>{students.length}</strong> students.
            </>
          ) : (
            <>
              Your student account currently has access to{" "}
              <strong>{courses.length}</strong> assigned courses,{" "}
              <strong>{totalSubjects}</strong> subjects,{" "}
              <strong>{totalChapters}</strong> chapters, and{" "}
              <strong>{totalTopics}</strong> topics.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default DashboardHome;