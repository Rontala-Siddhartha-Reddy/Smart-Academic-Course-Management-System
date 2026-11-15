import { useEffect, useState } from "react";
import axios from "axios";
import "./UsersPage.css";

const permissionLabels = {
  canAddCourse: "Can add course",
  canImportCourse: "Can import course Excel",
  canAddSubject: "Can add subject",
  canImportSubject: "Can import subject Excel",
  canAddChapter: "Can add chapter",
  canImportChapter: "Can import chapter Excel",
  canAddTopic: "Can add topic / study material",
  canImportTopic: "Can import topic Excel",
  canEditTopic: "Can edit topic / study material",
  canAddStudent: "Can add students",
  canRemoveStudent: "Can remove students",
  canViewUsers: "Can view users",
};

const emptyPermissions = {
  canAddCourse: false,
  canImportCourse: false,
  canAddSubject: false,
  canImportSubject: false,
  canAddChapter: false,
  canImportChapter: false,
  canAddTopic: false,
  canImportTopic: false,
  canEditTopic: false,
  canAddStudent: false,
  canRemoveStudent: false,
  canViewUsers: false,
};

function UsersPage({
  users,
  setUsers,
  courses,
  setPage,
  setSelectedCourseId,
  setSelectedSubjectId,
  setSelectedChapterId,
  setSelectedTopicId,
  currentUser,
  hasPermission = () => false,
  usersTab,
  setUsersTab,
  apiBase,
  fetchUsers,
}) {
  const [mode, setMode] = useState("list");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleteUserData, setDeleteUserData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "subadmin";

  const staffMembers = users.filter(
    (user) => user.role === "teacher" || user.role === "subadmin"
  );

  const students = users.filter((user) => user.role === "student");

  const visibleList = usersTab === "staff" ? staffMembers : students;

  const selectedUser = users.find(
    (user) => user.id === selectedUserId || user._id === selectedUserId
  );

  const canAddStaff = isAdmin;
  const canAddStudent = isAdmin || hasPermission("canAddStudent");
  const canRemoveStudent = isAdmin || hasPermission("canRemoveStudent");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "teacher",
    assignedCourses: [],
    permissions: { ...emptyPermissions },
  });

  useEffect(() => {
    setMode("list");
    setSelectedUserId(null);
    setDeleteUserData(null);
  }, [usersTab]);

  const normalizeUser = (user) => ({
    id: user._id || user.id,
    _id: user._id || user.id,
    name: user.name || "",
    email: user.email || "",
    password: user.password || "",
    role: user.role || "student",
    assignedCourses: user.assignedCourses || [],
    permissions: user.permissions || {},
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });

  const resetForm = (roleType) => {
    if (roleType === "staff") {
      setFormData({
        id: "",
        name: "",
        email: "",
        password: "",
        role: "teacher",
        assignedCourses: [],
        permissions: { ...emptyPermissions },
      });
    } else {
      setFormData({
        id: "",
        name: "",
        email: "",
        password: "",
        role: "student",
        assignedCourses: [],
        permissions: {},
      });
    }
  };

  const getAssignedCourseNames = (user) => {
    if (!user.assignedCourses || user.assignedCourses.length === 0) {
      return "No course assigned";
    }

    const names = user.assignedCourses
      .map((courseId) => {
        const course = courses.find((item) => item.id === courseId);
        return course?.courseName;
      })
      .filter(Boolean);

    return names.length > 0 ? names.join(", ") : "No course assigned";
  };

  const openAddPage = () => {
    if (usersTab === "staff" && !canAddStaff) {
      alert("Only admin or subadmin can add staff.");
      return;
    }

    if (usersTab === "students" && !canAddStudent) {
      alert("You do not have permission to add students.");
      return;
    }

    resetForm(usersTab);
    setMode("add");
    setSelectedUserId(null);
  };

  const openViewPage = (userId) => {
    setSelectedUserId(userId);
    setMode("view");
  };

  const openEditPage = (user) => {
    const userId = user.id || user._id;

    setSelectedUserId(userId);

    setFormData({
      id: userId,
      name: user.name || "",
      email: user.email || "",
      password: user.password || "",
      role: user.role || "student",
      assignedCourses: user.assignedCourses || [],
      permissions: user.permissions || {},
    });

    setMode("edit");
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleFormCourse = (courseId) => {
    setFormData((prev) => {
      const alreadyAssigned = prev.assignedCourses.includes(courseId);

      return {
        ...prev,
        assignedCourses: alreadyAssigned
          ? prev.assignedCourses.filter((id) => id !== courseId)
          : [...prev.assignedCourses, courseId],
      };
    });
  };

  const toggleFormPermission = (permissionName) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionName]: !prev.permissions?.[permissionName],
      },
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert("Please enter name.");
      return false;
    }

    if (!formData.email.trim()) {
      alert("Please enter email.");
      return false;
    }

    if (!formData.password.trim()) {
      alert("Please enter password.");
      return false;
    }

    return true;
  };

  const saveForm = async () => {
    if (!validateForm()) return;
    if (isSaving) return;

    try {
      setIsSaving(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: usersTab === "students" ? "student" : formData.role,
        assignedCourses: formData.assignedCourses || [],
        permissions:
          usersTab === "staff" && formData.role !== "subadmin"
            ? formData.permissions || {}
            : {},
      };

      if (mode === "add") {
        const response = await axios.post(`${apiBase}/users`, payload);
        const newUser = normalizeUser(response.data);

        setUsers((prevUsers) => [...prevUsers, newUser]);
        setSelectedUserId(newUser.id);
        setMode("view");

        if (fetchUsers) {
          await fetchUsers();
        }

        return;
      }

      if (mode === "edit") {
        const response = await axios.put(
          `${apiBase}/users/${formData.id}`,
          payload
        );

        const updatedUser = normalizeUser(response.data);

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === formData.id || user._id === formData.id
              ? updatedUser
              : user
          )
        );

        setSelectedUserId(updatedUser.id);
        setMode("view");

        if (fetchUsers) {
          await fetchUsers();
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("User not saved. Check backend server.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = (user) => {
    if (user.role === "admin") {
      alert("Admin user cannot be deleted from here.");
      return;
    }

    if (user.role === "teacher" || user.role === "subadmin") {
      if (!isAdmin) {
        alert("Only admin or subadmin can delete staff.");
        return;
      }
    }

    if (user.role === "student" && !canRemoveStudent) {
      alert("You do not have permission to remove students.");
      return;
    }

    setDeleteUserData(user);
  };

  const confirmDelete = async () => {
    if (!deleteUserData) return;

    try {
      const userId = deleteUserData.id || deleteUserData._id;

      await axios.delete(`${apiBase}/users/${userId}`);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userId && user._id !== userId)
      );

      setDeleteUserData(null);
      setSelectedUserId(null);
      setMode("list");

      if (fetchUsers) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("User not deleted. Check backend server.");
      }
    }
  };

  const goBackToDashboard = () => {
    setSelectedCourseId(null);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setSelectedTopicId(null);
    setPage("dashboard");
  };

  const goBackToList = () => {
    setSelectedUserId(null);
    setMode("list");
  };

  return (
    <div className="users-page">
      <header className="users-header">
        <div>
          <p className="small-label">Users Panel</p>
          <h1>{usersTab === "staff" ? "Staff Members" : "Students"}</h1>
          <p>
            {usersTab === "staff"
              ? "Manage teachers, sub admins, permissions and assigned courses."
              : "Manage students and assign their courses."}
          </p>
        </div>

        <button type="button" className="back-btn" onClick={goBackToDashboard}>
          ← Dashboard
        </button>
      </header>

      {mode === "list" && (
        <>
          <div className="users-tabs">
            {isAdmin && (
              <button
                type="button"
                className={usersTab === "staff" ? "active-tab" : ""}
                onClick={() => {
                  setUsersTab("staff");
                  setSelectedUserId(null);
                }}
              >
                Staff Members
              </button>
            )}

            <button
              type="button"
              className={usersTab === "students" ? "active-tab" : ""}
              onClick={() => {
                setUsersTab("students");
                setSelectedUserId(null);
              }}
            >
              Students
            </button>
          </div>

          <section className="users-section">
            <div className="users-section-title">
              <div>
                <p className="small-label">
                  {usersTab === "staff" ? "Staff List" : "Student List"}
                </p>
                <h2>
                  {usersTab === "staff" ? "Teachers / Sub Admins" : "Students"}
                </h2>
              </div>

              {usersTab === "staff" && canAddStaff && (
                <button
                  type="button"
                  className="header-add-btn"
                  onClick={openAddPage}
                >
                  + Add Staff
                </button>
              )}

              {usersTab === "students" && canAddStudent && (
                <button
                  type="button"
                  className="header-add-btn"
                  onClick={openAddPage}
                >
                  + Add Student
                </button>
              )}
            </div>

            {visibleList.length === 0 ? (
              <div className="empty-box">No users added yet.</div>
            ) : (
              <div className="user-table">
                <div className="user-table-head">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Assigned Course</span>
                  <span>Action</span>
                </div>

                {visibleList.map((user) => (
                  <div key={user.id || user._id} className="user-table-row">
                    <span>{user.name}</span>
                    <span>{user.email}</span>
                    <span className={`role-mini ${user.role}`}>
                      {user.role === "subadmin" ? "Sub Admin" : user.role}
                    </span>
                    <span>{getAssignedCourseNames(user)}</span>
                    <span className="table-actions">
                      <button
                        type="button"
                        className="view-user-btn"
                        onClick={() => openViewPage(user.id || user._id)}
                      >
                        View
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {mode === "view" && selectedUser && (
        <section className="users-section user-details-section">
          <div className="users-section-title">
            <div>
              <p className="small-label">Full Details</p>
              <h2>{selectedUser.name}</h2>
            </div>

            <div className="details-action-row">
              <button type="button" className="back-btn" onClick={goBackToList}>
                ← Back
              </button>

              {(isAdmin || selectedUser.role === "student") && (
                <button
                  type="button"
                  className="edit-user-btn"
                  onClick={() => openEditPage(selectedUser)}
                >
                  Edit
                </button>
              )}

              <button
                type="button"
                className="remove-user-btn"
                onClick={() => requestDelete(selectedUser)}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="details-card-grid">
            <div className="detail-card">
              <p>Name</p>
              <h3>{selectedUser.name}</h3>
            </div>

            <div className="detail-card">
              <p>Email</p>
              <h3>{selectedUser.email}</h3>
            </div>

            <div className="detail-card">
              <p>Password</p>
              <h3>{selectedUser.password}</h3>
            </div>

            <div className="detail-card">
              <p>Role</p>
              <h3>
                {selectedUser.role === "subadmin"
                  ? "Sub Admin"
                  : selectedUser.role}
              </h3>
            </div>
          </div>

          <div className="assign-box">
            <h4>Assigned Courses</h4>
            <p>{getAssignedCourseNames(selectedUser)}</p>
          </div>

          {selectedUser.role === "subadmin" && (
            <div className="permission-box">
              <h4>Permissions</h4>
              <p className="muted-text">
                Sub Admin has full admin-level permissions automatically.
              </p>
            </div>
          )}

          {selectedUser.role === "teacher" && (
            <div className="permission-box">
              <h4>Permissions</h4>

              <div className="permission-view-grid">
                {Object.keys(permissionLabels).map((permissionName) => (
                  <div
                    key={permissionName}
                    className={
                      selectedUser.permissions?.[permissionName]
                        ? "permission-status yes"
                        : "permission-status no"
                    }
                  >
                    <span>{permissionLabels[permissionName]}</span>
                    <b>
                      {selectedUser.permissions?.[permissionName]
                        ? "Allowed"
                        : "Not Allowed"}
                    </b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {(mode === "add" || mode === "edit") && (
        <section className="users-section user-details-section">
          <div className="users-section-title">
            <div>
              <p className="small-label">
                {mode === "add" ? "Add New User" : "Edit User"}
              </p>
              <h2>
                {usersTab === "staff" ? "Staff Details" : "Student Details"}
              </h2>
            </div>

            <button type="button" className="back-btn" onClick={goBackToList}>
              ← Back
            </button>
          </div>

          <div className="user-details-grid">
            <div className="user-edit-row">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                placeholder="Enter full name"
                disabled={isSaving}
                onChange={(event) =>
                  handleFormChange("name", event.target.value)
                }
              />
            </div>

            <div className="user-edit-row">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                placeholder="Enter email"
                disabled={isSaving}
                onChange={(event) =>
                  handleFormChange("email", event.target.value)
                }
              />
            </div>

            <div className="user-edit-row">
              <label>Password</label>
              <input
                type="text"
                value={formData.password}
                placeholder="Enter password"
                disabled={isSaving}
                onChange={(event) =>
                  handleFormChange("password", event.target.value)
                }
              />
            </div>

            <div className="user-edit-row">
              <label>Role</label>

              {usersTab === "staff" ? (
                <select
                  value={formData.role}
                  disabled={isSaving}
                  onChange={(event) =>
                    handleFormChange("role", event.target.value)
                  }
                >
                  <option value="teacher">Teacher</option>
                  <option value="subadmin">Sub Admin</option>
                </select>
              ) : (
                <input type="text" value="student" disabled />
              )}
            </div>
          </div>

          <div className="assign-box">
            <h4>Assign Courses</h4>

            {formData.role === "subadmin" ? (
              <p className="muted-text">
                Sub Admin can access all courses automatically.
              </p>
            ) : courses.length === 0 ? (
              <p className="muted-text">No courses available.</p>
            ) : (
              courses.map((course) => (
                <label key={course.id} className="checkbox-line">
                  <input
                    type="checkbox"
                    checked={formData.assignedCourses.includes(course.id)}
                    disabled={isSaving}
                    onChange={() => toggleFormCourse(course.id)}
                  />
                  {course.courseName}
                </label>
              ))
            )}
          </div>

          {usersTab === "staff" && formData.role === "subadmin" && (
            <div className="permission-box">
              <h4>Permissions</h4>
              <p className="muted-text">
                Sub Admin has full admin-level permissions automatically.
              </p>
            </div>
          )}

          {usersTab === "staff" && formData.role !== "subadmin" && (
            <div className="permission-box">
              <h4>Permissions</h4>

              {Object.keys(permissionLabels).map((permissionName) => (
                <label key={permissionName} className="checkbox-line">
                  <input
                    type="checkbox"
                    checked={formData.permissions?.[permissionName] === true}
                    disabled={isSaving}
                    onChange={() => toggleFormPermission(permissionName)}
                  />
                  {permissionLabels[permissionName]}
                </label>
              ))}
            </div>
          )}

          <div className="save-row">
            <button
              type="button"
              className="cancel-btn"
              onClick={goBackToList}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="save-btn"
              onClick={saveForm}
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : mode === "add"
                ? "Save User"
                : "Update User"}
            </button>
          </div>
        </section>
      )}

      {deleteUserData && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-box">
            <h2>Delete User?</h2>
            <p>
              Are you sure you want to delete <b>{deleteUserData.name}</b>?
            </p>
            <p className="delete-warning">
              This action will remove this user from MongoDB.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setDeleteUserData(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-btn"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;