const initialUsers = [
  {
    id: "admin-1",
    name: "Main Admin",
    email: "admin@gmail.com",
    password: "admin123",
    role: "admin",
    assignedCourses: [],
    permissions: {
      allAccess: true,
    },
  },
  {
    id: "teacher-1",
    name: "Teacher One",
    email: "teacher@gmail.com",
    password: "teacher123",
    role: "teacher",
    assignedCourses: [],
    permissions: {
      canAddCourse: false,
      canImportCourse: false,
      canAddSubject: true,
      canImportSubject: true,
      canAddChapter: true,
      canImportChapter: true,
      canAddTopic: true,
      canImportTopic: true,
      canEditTopic: true,
      canAddStudent: false,
      canRemoveStudent: false,
      canViewUsers: false,
    },
  },
  {
    id: "student-1",
    name: "Student One",
    email: "student@gmail.com",
    password: "student123",
    role: "student",
    assignedCourses: [],
    permissions: {},
  },
];

export default initialUsers;