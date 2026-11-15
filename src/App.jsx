import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import axios from "axios";

import Sidebar from "./components/Sidebar";
import NameModal from "./components/NameModal/NameModal";
import ConfirmModal from "./components/ConfirmModal/ConfirmModal";
import { readExcelFile, downloadExcelTemplate } from "./utils/excelUtils";

import LoginPage from "./pages/LoginPage/LoginPage";
import DashboardHome from "./components/DashboardHome";
import UsersPage from "./pages/UsersPage/UsersPage";


import SubjectsPage from "./pages/SubjectsPage/SubjectsPage";
import ChaptersPage from "./pages/ChaptersPage/ChaptersPage";
import TopicsPage from "./pages/TopicsPage/TopicsPage";
import TopicViewPage from "./pages/TopicViewPage/TopicViewPage";
import AddEditTopicPage from "./pages/AddEditTopicPage/AddEditTopicPage";

function App() {
  const API_BASE = "http://localhost:5000/api";
  const API_URL = `${API_BASE}/courses`;

  const navigate = useNavigate();
  const location = useLocation();

  const courseImportRef = useRef(null);
  const subjectImportRef = useRef(null);
  const chapterImportRef = useRef(null);
  const topicImportRef = useRef(null);
  const editTopicLoadedRef = useRef(null);

  const [courses, setCourses] = useState([]);
  const [isAppLoading, setIsAppLoading] = useState(true);
const [selectedTopicDirect, setSelectedTopicDirect] = useState(null);
  const [showCourses, setShowCourses] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [usersTab, setUsersTab] = useState("staff");
  

  const [users, setUsers] = useState([]);

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("currentDashboardUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [page, setPage] = useState("dashboard");
  const [urlReady, setUrlReady] = useState(false);

  const [topicView, setTopicView] = useState(
    localStorage.getItem("topicView") || "theory"
  );

  const [selectedCourseId, setSelectedCourseId] = useState(
  localStorage.getItem("selectedCourseId") || null
);
const [selectedSubjectId, setSelectedSubjectId] = useState(
  localStorage.getItem("selectedSubjectId") || null
);
const [selectedChapterId, setSelectedChapterId] = useState(
  localStorage.getItem("selectedChapterId") || null
);
const [selectedTopicId, setSelectedTopicId] = useState(
  localStorage.getItem("selectedTopicId") || null
);

  const [editingTopicId, setEditingTopicId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalValue, setModalValue] = useState("");

  const [confirmModal, setConfirmModal] = useState({
  isOpen: false,
  title: "",
  message: "",
  confirmText: "OK",
  type: "warning",
  showCancel: true,
  onConfirm: null,
});

  const [editingItemId, setEditingItemId] = useState(null);



  const emptyTopicData = {
  topicName: "",
  theoryDocuments: [],
  problemDocuments: [],
  theory: {
    matter: "",
    matterExplanation: "",

    examples: "",
    examplesExplanation: "",

    mindMap: "",
    mindMapExplanation: "",

    theoryEquation: "",
    explanationEquation: "",
    exampleEquation: "",
  },
  problems: {
    questions: "",
    questionsExplanation: "",

    solution: "",
    solutionExplanation: "",

    relatedTheory: "",
    relatedTheoryExplanation: "",

    questionEquation: "",
    solutionEquation: "",
    relatedTheoryEquation: "",
  },
};

const normalizeEditorText = (text = "") => {
  if (!text) return "";

  return String(text)
    .replace(/\\textasciicircum\s*/gi, "^")
    .replace(/textasciicircum\s*/gi, "^")
    .replace(/\\text\s*{([^}]*)}/g, "$1")
    .replace(/\\mathrm\s*{([^}]*)}/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

  const [newTopic, setNewTopic] = useState(emptyTopicData);

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "subadmin";
  const isTeacher = currentUser?.role === "teacher";
  const isStudent = currentUser?.role === "student";

  const hasPermission = (permissionName) => {
  if (!currentUser) return false;

  if (currentUser.role === "admin" || currentUser.role === "subadmin") {
    return true;
  }

  return currentUser.permissions?.[permissionName] === true;
};

  const canOpenUsersPage =
  currentUser?.role === "admin" ||
  currentUser?.role === "subadmin" ||
  hasPermission("canViewUsers") ||
  hasPermission("canAddStudent") ||
  hasPermission("canRemoveStudent");

  const visibleCourses = isAdmin
    ? courses
    : courses.filter((course) =>
        currentUser?.assignedCourses?.includes(course.id)
      );

  const convertMongoCourse = (course) => ({
    id: course._id,
    _id: course._id,
    courseName: course.courseName,
    subjects: [],
  });

  const convertMongoSubject = (subject) => ({
    id: subject._id,
    _id: subject._id,
    subjectName: subject.subjectName,
    courseId: subject.courseId,
    chapters: [],
  });

  const convertMongoChapter = (chapter) => ({
    id: chapter._id,
    _id: chapter._id,
    chapterName: chapter.chapterName,
    subjectId: chapter.subjectId,
    topics: [],
  });

  const convertMongoTopic = (topic) => ({
  id: topic._id,
  _id: topic._id,
  topicName: topic.topicName,
  chapterId: topic.chapterId,

  theoryDocuments: topic.theoryDocuments || [],
  problemDocuments: topic.problemDocuments || [],

  theory: {
    matter: topic.theoryMatter || "",
    matterExplanation: topic.theoryMatterExplanation || "",

    examples: topic.exampleProblemsWithSolution || "",
    examplesExplanation: topic.exampleProblemsExplanation || "",

    mindMap: topic.mindMap || "",
    mindMapExplanation: topic.mindMapExplanation || "",

    theoryEquation: topic.theoryEquation || "",
    explanationEquation: topic.explanationEquation || "",
    exampleEquation: topic.exampleEquation || "",
  },

  problems: {
    questions: topic.questions || "",
    questionsExplanation: topic.questionsExplanation || "",

    solution: topic.solution || "",
    solutionExplanation: topic.solutionExplanation || "",

    relatedTheory: topic.relatedTheory || "",
    relatedTheoryExplanation: topic.relatedTheoryExplanation || "",

    questionEquation: topic.questionEquation || "",
    solutionEquation: topic.solutionEquation || "",
    relatedTheoryEquation: topic.relatedTheoryEquation || "",
  },
});

const convertFrontendTopicToMongo = (topicData, chapterId) => ({
  topicName: topicData.topicName || "",
  chapterId,

  theoryMatter: topicData.theory?.matter || "",
  theoryMatterExplanation: topicData.theory?.matterExplanation || "",

  mindMap: topicData.theory?.mindMap || "",
  mindMapExplanation: topicData.theory?.mindMapExplanation || "",

  exampleProblemsWithSolution: topicData.theory?.examples || "",
  exampleProblemsExplanation: topicData.theory?.examplesExplanation || "",

  questions: topicData.problems?.questions || "",
  questionsExplanation: topicData.problems?.questionsExplanation || "",

  solution: topicData.problems?.solution || "",
  solutionExplanation: topicData.problems?.solutionExplanation || "",

  relatedTheory: topicData.problems?.relatedTheory || "",
  relatedTheoryExplanation: topicData.problems?.relatedTheoryExplanation || "",

  theoryEquation: topicData.theory?.theoryEquation || "",
  explanationEquation: topicData.theory?.explanationEquation || "",
  exampleEquation: topicData.theory?.exampleEquation || "",

  questionEquation: topicData.problems?.questionEquation || "",
  solutionEquation: topicData.problems?.solutionEquation || "",
  relatedTheoryEquation: topicData.problems?.relatedTheoryEquation || "",

  theoryDocuments: [],
problemDocuments: [],
});

const saveTopicUploads = async (topicId, theoryDocuments = [], problemDocuments = []) => {
  const savedTheoryDocuments =
    theoryDocuments.length > 0
      ? await axios.post(`${API_BASE}/uploads/bulk`, {
          topicId,
          documentType: "theory",
          documents: theoryDocuments,
        })
      : { data: [] };

  const savedProblemDocuments =
    problemDocuments.length > 0
      ? await axios.post(`${API_BASE}/uploads/bulk`, {
          topicId,
          documentType: "problem",
          documents: problemDocuments,
        })
      : { data: [] };

  return {
    theoryDocuments: savedTheoryDocuments.data || [],
    problemDocuments: savedProblemDocuments.data || [],
  };
};

const fetchUploadsByTopic = async (topicId) => {
  const response = await axios.get(`${API_BASE}/uploads/topic/${topicId}`);
  const uploads = response.data || [];

  return {
    theoryDocuments: uploads.filter((doc) => doc.documentType === "theory"),
    problemDocuments: uploads.filter((doc) => doc.documentType === "problem"),
  };
};

const replaceTopicUploads = async (topicId, theoryDocuments = [], problemDocuments = []) => {
  await axios.delete(`${API_BASE}/uploads/topic/${topicId}`);

  return await saveTopicUploads(topicId, theoryDocuments, problemDocuments);
};

  const convertTheoryFromMongo = (theory) => ({
    matter: theory?.theoryMatter || "",
    explanation: theory?.explanation || "",
    examples: theory?.exampleProblemsWithSolution || "",
    mindMap: theory?.mindMap || "",
    theoryEquation: theory?.theoryEquation || "",
    explanationEquation: theory?.explanationEquation || "",
    exampleEquation: theory?.exampleEquation || "",
  });

  const convertProblemFromMongo = (problem) => ({
    questions: problem?.questions || "",
    solution: problem?.solution || "",
    relatedTheory: problem?.relatedTheory || "",
    questionEquation: problem?.questionEquation || "",
    solutionEquation: problem?.solutionEquation || "",
    relatedTheoryEquation: problem?.relatedTheoryEquation || "",
  });

  const openConfirmModal = ({
  title,
  message,
  confirmText = "OK",
  type = "warning",
  showCancel = true,
  onConfirm,
}) => {
  setConfirmModal({
    isOpen: true,
    title,
    message,
    confirmText,
    type,
    showCancel,
    onConfirm,
  });
};

const closeConfirmModal = () => {
  setConfirmModal({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "OK",
    type: "warning",
    showCancel: true,
    onConfirm: null,
  });
};

const showInfoModal = (message, title = "Information") => {
  openConfirmModal({
    title,
    message,
    confirmText: "OK",
    type: "info",
    showCancel: false,
    onConfirm: closeConfirmModal,
  });
};

const showWarningModal = (message, title = "Warning") => {
  openConfirmModal({
    title,
    message,
    confirmText: "OK",
    type: "warning",
    showCancel: false,
    onConfirm: closeConfirmModal,
  });
};

const showErrorModal = (message, title = "Error") => {
  openConfirmModal({
    title,
    message,
    confirmText: "OK",
    type: "danger",
    showCancel: false,
    onConfirm: closeConfirmModal,
  });
};

const showSuccessModal = (message, title = "Success") => {
  openConfirmModal({
    title,
    message,
    confirmText: "OK",
    type: "success",
    showCancel: false,
    onConfirm: closeConfirmModal,
  });
};

  const updateSubjectInCourse = (courseId, subjectId, updater) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              subjects: course.subjects.map((subject) =>
                subject.id === subjectId ? updater(subject) : subject
              ),
            }
          : course
      )
    );
  };

  const updateChapterInSubject = (courseId, subjectId, chapterId, updater) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              subjects: course.subjects.map((subject) =>
                subject.id === subjectId
                  ? {
                      ...subject,
                      chapters: subject.chapters.map((chapter) =>
                        chapter.id === chapterId ? updater(chapter) : chapter
                      ),
                    }
                  : subject
              ),
            }
          : course
      )
    );
  };

  const updateTopicInChapter = (
    courseId,
    subjectId,
    chapterId,
    topicId,
    updater
  ) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              subjects: course.subjects.map((subject) =>
                subject.id === subjectId
                  ? {
                      ...subject,
                      chapters: subject.chapters.map((chapter) =>
                        chapter.id === chapterId
                          ? {
                              ...chapter,
                              topics: chapter.topics.map((topic) =>
                                topic.id === topicId ? updater(topic) : topic
                              ),
                            }
                          : chapter
                      ),
                    }
                  : subject
              ),
            }
          : course
      )
    );
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_URL);
      const convertedCourses = response.data.map(convertMongoCourse);
      setCourses(convertedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      showErrorModal("Backend data not loading. Check MongoDB and server.");
    }
  };

  const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE}/users`);

    const convertedUsers = response.data.map((user) => ({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      permissions: user.permissions || {},
      assignedCourses: user.assignedCourses || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    setUsers(convertedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    showErrorModal("Users not loading from MongoDB. Check backend /api/users.");
  }
};

  const fetchSubjectsByCourse = async (courseId) => {
  if (!courseId) return;

  try {
    const response = await axios.get(`${API_BASE}/subjects/${courseId}`);
    const convertedSubjects = response.data.map(convertMongoSubject);

    const subjectsWithChapters = await Promise.all(
      convertedSubjects.map(async (subject) => {
        try {
          const chapterResponse = await axios.get(
            `${API_BASE}/chapters/${subject.id}`
          );

          const convertedChapters =
            chapterResponse.data.map(convertMongoChapter);

          return {
            ...subject,
            chapters: convertedChapters,
          };
        } catch (error) {
          console.error(
            "Error fetching chapters count for subject:",
            subject.id,
            error
          );

          return {
            ...subject,
            chapters: [],
          };
        }
      })
    );

    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              subjects: subjectsWithChapters,
            }
          : course
      )
    );
  } catch (error) {
    console.error("Error fetching subjects:", error);
  }
};

  const fetchChaptersBySubject = async (subjectId) => {
  if (!subjectId || !selectedCourseId) return;

  try {
    const response = await axios.get(`${API_BASE}/chapters/${subjectId}`);
    const convertedChapters = response.data.map(convertMongoChapter);

    const chaptersWithTopics = await Promise.all(
      convertedChapters.map(async (chapter) => {
        try {
          const topicResponse = await axios.get(
            `${API_BASE}/topics/${chapter.id}`
          );

          const convertedTopics =
            topicResponse.data.map(convertMongoTopic);

          return {
            ...chapter,
            topics: convertedTopics,
          };
        } catch (error) {
          console.error(
            "Error fetching topics count for chapter:",
            chapter.id,
            error
          );

          return {
            ...chapter,
            topics: [],
          };
        }
      })
    );

    updateSubjectInCourse(selectedCourseId, subjectId, (subject) => ({
      ...subject,
      chapters: chaptersWithTopics,
    }));
  } catch (error) {
    console.error("Error fetching chapters:", error);
  }
};

  const fetchTopicsByChapter = async (chapterId) => {
    if (!chapterId || !selectedCourseId || !selectedSubjectId) return;

    try {
      const response = await axios.get(`${API_BASE}/topics/${chapterId}`);
      const convertedTopics = response.data.map(convertMongoTopic);

      updateChapterInSubject(
        selectedCourseId,
        selectedSubjectId,
        chapterId,
        (chapter) => ({
          ...chapter,
          topics: convertedTopics,
        })
      );
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchTopicDetails = async (topicId) => {
  if (!topicId) return;

  try {
    const response = await axios.get(`${API_BASE}/topics/single/${topicId}`);
    const convertedTopic = convertMongoTopic(response.data);

    const uploads = await fetchUploadsByTopic(topicId);

    const finalTopic = {
      ...convertedTopic,
      theoryDocuments: uploads.theoryDocuments,
      problemDocuments: uploads.problemDocuments,
    };

    setSelectedTopicDirect(finalTopic);

    if (finalTopic.chapterId && !selectedChapterId) {
      setSelectedChapterId(finalTopic.chapterId);
    }

    if (selectedCourseId && selectedSubjectId && selectedChapterId) {
      updateTopicInChapter(
        selectedCourseId,
        selectedSubjectId,
        selectedChapterId,
        topicId,
        () => finalTopic
      );
    }
  } catch (error) {
    console.error("Error fetching topic details:", error);
  }
};

 useEffect(() => {
  const loadInitialData = async () => {
    try {
      setIsAppLoading(true);
      await Promise.all([fetchCourses(), fetchUsers()]);
    } catch (error) {
      console.error("Initial data loading error:", error);
    } finally {
      setIsAppLoading(false);
    }
  };

  loadInitialData();
}, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchSubjectsByCourse(selectedCourseId);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchChaptersBySubject(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    if (selectedChapterId) {
      fetchTopicsByChapter(selectedChapterId);
    }
  }, [selectedChapterId]);

  useEffect(() => {
    if (selectedTopicId) {
      fetchTopicDetails(selectedTopicId);
    }
  }, [selectedTopicId]);


  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentDashboardUser", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("topicView", topicView);
  }, [topicView]);

  useEffect(() => {
  if (selectedCourseId) {
    localStorage.setItem("selectedCourseId", selectedCourseId);
  } else {
    localStorage.removeItem("selectedCourseId");
  }
}, [selectedCourseId]);

useEffect(() => {
  if (selectedSubjectId) {
    localStorage.setItem("selectedSubjectId", selectedSubjectId);
  } else {
    localStorage.removeItem("selectedSubjectId");
  }
}, [selectedSubjectId]);

useEffect(() => {
  if (selectedChapterId) {
    localStorage.setItem("selectedChapterId", selectedChapterId);
  } else {
    localStorage.removeItem("selectedChapterId");
  }
}, [selectedChapterId]);

useEffect(() => {
  if (selectedTopicId) {
    localStorage.setItem("selectedTopicId", selectedTopicId);
  } else {
    localStorage.removeItem("selectedTopicId");
  }
}, [selectedTopicId]);

  const handleLogin = (user) => {
  const loggedUser = {
    ...user,
    id: user.id || user._id,
    assignedCourses: user.assignedCourses || [],
    permissions: user.permissions || {},
  };

  setCurrentUser(loggedUser);
  localStorage.setItem("currentDashboardUser", JSON.stringify(loggedUser));

  setPage("dashboard");
  setSelectedCourseId(null);
  setSelectedSubjectId(null);
  setSelectedChapterId(null);
  setSelectedTopicId(null);
  setEditingTopicId(null);
  navigate("/");
};

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentDashboardUser");
    localStorage.removeItem("selectedCourseId");
localStorage.removeItem("selectedSubjectId");
localStorage.removeItem("selectedChapterId");
localStorage.removeItem("selectedTopicId");
localStorage.removeItem("topicView");
    setPage("dashboard");
    setSelectedCourseId(null);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setSelectedTopicId(null);
    setEditingTopicId(null);
    navigate("/");
  };

  const findParentsBySubjectId = (subjectId) => {
    for (const course of courses) {
      const subject = course.subjects.find((s) => s.id === subjectId);
      if (subject) {
        return {
          courseId: course.id,
          subjectId: subject.id,
        };
      }
    }

    return null;
  };

  const findParentsByChapterId = (chapterId) => {
    for (const course of courses) {
      for (const subject of course.subjects) {
        const chapter = subject.chapters.find((c) => c.id === chapterId);
        if (chapter) {
          return {
            courseId: course.id,
            subjectId: subject.id,
            chapterId: chapter.id,
          };
        }
      }
    }

    return null;
  };

  const findParentsByTopicId = (topicId) => {
    for (const course of courses) {
      for (const subject of course.subjects) {
        for (const chapter of subject.chapters) {
          const topic = chapter.topics.find((t) => t.id === topicId);
          if (topic) {
            return {
              courseId: course.id,
              subjectId: subject.id,
              chapterId: chapter.id,
              topicId: topic.id,
            };
          }
        }
      }
    }

    return null;
  };

  useEffect(() => {
    if (!currentUser) {
      setUrlReady(true);
      return;
    }

    const path = location.pathname;

    if (path === "/users") {
      if (canOpenUsersPage) {
        setPage("users");
      } else {
        setPage("dashboard");
        navigate("/");
      }

      setSelectedCourseId(null);
      setSelectedSubjectId(null);
      setSelectedChapterId(null);
      setSelectedTopicId(null);
      setEditingTopicId(null);
      setUrlReady(true);
      return;
    }

    if (path === "/") {
  setPage("dashboard");

  setSelectedCourseId(null);
  setSelectedSubjectId(null);
  setSelectedChapterId(null);
  setSelectedTopicId(null);
  setSelectedTopicDirect(null);
  setEditingTopicId(null);

  setTopicView("theory");
  setNewTopic(emptyTopicData);

  setUrlReady(true);
  return;
}

    let match;

    match = path.match(/^\/courses\/([^/]+)\/subjects$/);
    if (match) {
      const courseId = match[1];

      setSelectedCourseId(courseId);
      setSelectedSubjectId(null);
      setSelectedChapterId(null);
      setSelectedTopicId(null);
      setEditingTopicId(null);
      setPage("subjects");
      setUrlReady(true);
      return;
    }

    match = path.match(/^\/subjects\/([^/]+)\/chapters$/);
    if (match) {
      const subjectId = match[1];
      const parents = findParentsBySubjectId(subjectId);

      if (parents) {
        setSelectedCourseId(parents.courseId);
      }

      setSelectedSubjectId(subjectId);
      setSelectedChapterId(null);
      setSelectedTopicId(null);
      setEditingTopicId(null);
      setPage("chapters");
      setUrlReady(true);
      return;
    }

    match = path.match(/^\/chapters\/([^/]+)\/topics$/);
    if (match) {
      const chapterId = match[1];
      const parents = findParentsByChapterId(chapterId);

      if (parents) {
        setSelectedCourseId(parents.courseId);
        setSelectedSubjectId(parents.subjectId);
      }

      setSelectedChapterId(chapterId);
      setSelectedTopicId(null);
      setEditingTopicId(null);
      setPage("topics");
      setUrlReady(true);
      return;
    }

    match = path.match(/^\/chapters\/([^/]+)\/topics\/add$/);
    if (match) {
      const chapterId = match[1];
      const parents = findParentsByChapterId(chapterId);

      if (!hasPermission("canAddTopic")) {
        showWarningModal("You do not have permission to add topics.");
        setPage("topics");
        navigate(`/chapters/${chapterId}/topics`);
        return;
      }

      if (parents) {
        setSelectedCourseId(parents.courseId);
        setSelectedSubjectId(parents.subjectId);
      }

      setSelectedChapterId(chapterId);
      setSelectedTopicId(null);
      setEditingTopicId(null);
      setTopicView("theory");
      setPage("addTopic");
      setUrlReady(true);
      return;
    }

    match = path.match(/^\/topics\/([^/]+)\/view$/);
    if (match) {
      const topicId = match[1];
      const parents = findParentsByTopicId(topicId);

      if (parents) {
        setSelectedCourseId(parents.courseId);
        setSelectedSubjectId(parents.subjectId);
        setSelectedChapterId(parents.chapterId);
      }

      setSelectedTopicId(topicId);
      setEditingTopicId(null);
      setPage("viewTopic");
      setUrlReady(true);
      return;
    }

    match = path.match(/^\/topics\/([^/]+)\/edit$/);
    if (match) {
      const topicId = match[1];
      const parents = findParentsByTopicId(topicId);

      if (!hasPermission("canEditTopic")) {
        showWarningModal("You do not have permission to edit topics.");
        setPage("viewTopic");
        navigate(`/topics/${topicId}/view`);
        return;
      }

      if (parents) {
        setSelectedCourseId(parents.courseId);
        setSelectedSubjectId(parents.subjectId);
        setSelectedChapterId(parents.chapterId);
      }

      setSelectedTopicId(topicId);
      setEditingTopicId(topicId);
      setTopicView("theory");
      setPage("editTopic");
      setUrlReady(true);
      return;
    }

    setPage("dashboard");
    setUrlReady(true);
  }, [location.pathname, currentUser]);

 useEffect(() => {
  if (!urlReady || !currentUser) return;
    /*
    If URL already changed from dashboard to a valid route,
    do not force it back to "/".
    Let the URL-reading useEffect update the page state.
  */
  if (page === "dashboard" && location.pathname !== "/") {
    return;
  }

  /*
    If browser back/forward changes the URL,
    do not force old React page state back again.
    Let the URL-reading useEffect above control the page.
  */
  if (location.pathname === "/" && page !== "dashboard") {
  setPage("dashboard");
  setSelectedCourseId(null);
  setSelectedSubjectId(null);
  setSelectedChapterId(null);
  setSelectedTopicId(null);
  setSelectedTopicDirect(null);
  setEditingTopicId(null);
  return;
}

  let targetPath = "";

  if (page === "dashboard") {
    targetPath = "/";
  }

  if (page === "users") {
    targetPath = "/users";
  }

  if (page === "subjects" && selectedCourseId) {
    targetPath = `/courses/${selectedCourseId}/subjects`;
  }

  if (page === "chapters" && selectedSubjectId) {
    targetPath = `/subjects/${selectedSubjectId}/chapters`;
  }

  if (page === "topics" && selectedChapterId) {
    targetPath = `/chapters/${selectedChapterId}/topics`;
  }

  if (page === "viewTopic" && selectedTopicId) {
    targetPath = `/topics/${selectedTopicId}/view`;
  }

  if (page === "addTopic" && selectedChapterId) {
    targetPath = `/chapters/${selectedChapterId}/topics/add`;
  }

  if (page === "editTopic" && (editingTopicId || selectedTopicId)) {
    targetPath = `/topics/${editingTopicId || selectedTopicId}/edit`;
  }

  if (targetPath && location.pathname !== targetPath) {
    navigate(targetPath, { replace: false });
  }
}, [
  urlReady,
  currentUser,
  page,
  selectedCourseId,
  selectedSubjectId,
  selectedChapterId,
  selectedTopicId,
  editingTopicId,
  location.pathname,
  navigate,
]);

  const selectedCourse = courses.find(
    (course) => course.id === selectedCourseId
  );

  const selectedSubject = selectedCourse?.subjects.find(
    (subject) => subject.id === selectedSubjectId
  );

  const selectedChapter = selectedSubject?.chapters.find(
    (chapter) => chapter.id === selectedChapterId
  );

  const selectedTopicFromChapter = selectedChapter?.topics.find(
  (topic) => topic.id === selectedTopicId
);

const selectedTopic = selectedTopicDirect || selectedTopicFromChapter;

  useEffect(() => {
  if (page !== "editTopic") {
    editTopicLoadedRef.current = null;
    return;
  }

  if (!selectedTopic) return;

  const topicId = selectedTopic.id || selectedTopic._id;

  // Prevent reloading editor repeatedly and wiping typed matter
  if (editTopicLoadedRef.current === topicId) return;

  editTopicLoadedRef.current = topicId;

  setEditingTopicId(topicId);
  setNewTopic(prepareTopicForEdit(selectedTopic));
}, [page, selectedTopic]);

  const openNameModal = (type) => {
    if (type === "course" && !hasPermission("canAddCourse")) {
      showWarningModal("You do not have permission to add courses.");
      return;
    }

    if (type === "subject" && !hasPermission("canAddSubject")) {
      showWarningModal("You do not have permission to add subjects.");
      return;
    }

    if (type === "chapter" && !hasPermission("canAddChapter")) {
      showWarningModal("You do not have permission to add chapters.");
      return;
    }

    if (type === "subject" && !selectedCourseId) {
      showWarningModal("Please select a course first.");
      return;
    }

    if (type === "chapter" && !selectedSubjectId) {
      showWarningModal("Please select a subject first.");
      return;
    }

    setModalType(type);
    setModalValue("");
    setModalOpen(true);
  };

  const openEditSubjectModal = (subject) => {
  if (!hasPermission("canEditSubject")) {
    showWarningModal("You do not have permission to edit subjects.");
    return;
  }

  setEditingItemId(subject.id);
  setModalType("editSubject");
  setModalValue(subject.subjectName || "");
  setModalOpen(true);
};

const openEditChapterModal = (chapter) => {
  if (!hasPermission("canEditChapter")) {
    showWarningModal("You do not have permission to edit chapters.");
    return;
  }

  setEditingItemId(chapter.id);
  setModalType("editChapter");
  setModalValue(chapter.chapterName || "");
  setModalOpen(true);
};

  const handleModalSave = async () => {
    const name = modalValue.trim();

    if (!name) {
      showWarningModal("Please enter a name.");
      return;
    }

    try {
      if (modalType === "course") {
        const response = await axios.post(API_URL, {
          courseName: name,
        });

        const newCourse = convertMongoCourse(response.data);

        setCourses((prevCourses) => [...prevCourses, newCourse]);
        setSelectedCourseId(newCourse.id);
        setSelectedSubjectId(null);
        setSelectedChapterId(null);
        setSelectedTopicId(null);
        setPage("subjects");
      }

      if (modalType === "subject") {
        const response = await axios.post(`${API_BASE}/subjects`, {
          subjectName: name,
          courseId: selectedCourseId,
        });

        const newSubject = convertMongoSubject(response.data);

        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === selectedCourseId
              ? {
                  ...course,
                  subjects: [...(course.subjects || []), newSubject],
                }
              : course
          )
        );

        setSelectedSubjectId(newSubject.id);
        setSelectedChapterId(null);
        setSelectedTopicId(null);
        setPage("chapters");
      }

      if (modalType === "chapter") {
        const response = await axios.post(`${API_BASE}/chapters`, {
          chapterName: name,
          subjectId: selectedSubjectId,
        });

        const newChapter = convertMongoChapter(response.data);

        updateSubjectInCourse(selectedCourseId, selectedSubjectId, (subject) => ({
          ...subject,
          chapters: [...(subject.chapters || []), newChapter],
        }));

        setSelectedChapterId(newChapter.id);
        setSelectedTopicId(null);
        setPage("topics");
      }

      if (modalType === "editSubject") {
  const response = await axios.put(`${API_BASE}/subjects/${editingItemId}`, {
    subjectName: name,
  });

  const updatedSubject = convertMongoSubject(response.data);

  setCourses((prevCourses) =>
    prevCourses.map((course) =>
      course.id === selectedCourseId
        ? {
            ...course,
            subjects: course.subjects.map((subject) =>
              subject.id === editingItemId
                ? {
                    ...subject,
                    subjectName: updatedSubject.subjectName,
                  }
                : subject
            ),
          }
        : course
    )
  );
}

if (modalType === "editChapter") {
  const response = await axios.put(`${API_BASE}/chapters/${editingItemId}`, {
    chapterName: name,
  });

  const updatedChapter = convertMongoChapter(response.data);

  updateSubjectInCourse(selectedCourseId, selectedSubjectId, (subject) => ({
    ...subject,
    chapters: subject.chapters.map((chapter) =>
      chapter.id === editingItemId
        ? {
            ...chapter,
            chapterName: updatedChapter.chapterName,
          }
        : chapter
    ),
  }));
}

      setModalOpen(false);
setModalValue("");
setModalType("");
setEditingItemId(null);
    } catch (error) {
      console.error("Error saving:", error);
      showErrorModal("Data not saved.");
    }
  };

  const handleImportCourses = async (event) => {
    if (!hasPermission("canImportCourse")) {
      showWarningModal("You do not have permission to import courses.");
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    readExcelFile(file, async (rows) => {
      const importedCourses = rows.filter((row) => row.courseName);

      try {
        const savedCourses = [];

        for (const row of importedCourses) {
          const response = await axios.post(API_URL, {
            courseName: row.courseName,
          });

          savedCourses.push(convertMongoCourse(response.data));
        }

        setCourses((prevCourses) => [...prevCourses, ...savedCourses]);
      } catch (error) {
        console.error("Error importing courses:", error);
        showErrorModal("Courses not imported.");
      }
    });

    event.target.value = "";
  };

  const handleImportSubjects = async (event) => {
    if (!hasPermission("canImportSubject")) {
      showWarningModal("You do not have permission to import subjects.");
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    if (!selectedCourseId) {
      showWarningModal("Please select a course first.");
      return;
    }

    readExcelFile(file, async (rows) => {
      const importedRows = rows.filter((row) => row.subjectName);

      try {
        const savedSubjects = [];

        for (const row of importedRows) {
          const response = await axios.post(`${API_BASE}/subjects`, {
            subjectName: row.subjectName,
            courseId: selectedCourseId,
          });

          savedSubjects.push(convertMongoSubject(response.data));
        }

        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === selectedCourseId
              ? {
                  ...course,
                  subjects: [...course.subjects, ...savedSubjects],
                }
              : course
          )
        );
      } catch (error) {
        console.error("Error importing subjects:", error);
        showErrorModal("Subjects not imported.");
      }
    });

    event.target.value = "";
  };

  const handleImportChapters = async (event) => {
    if (!hasPermission("canImportChapter")) {
      showWarningModal("You do not have permission to import chapters.");
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    if (!selectedSubjectId) {
      showWarningModal("Please select a subject first.");
      return;
    }

    readExcelFile(file, async (rows) => {
      const importedRows = rows.filter((row) => row.chapterName);

      try {
        const savedChapters = [];

        for (const row of importedRows) {
          const response = await axios.post(`${API_BASE}/chapters`, {
            chapterName: row.chapterName,
            subjectId: selectedSubjectId,
          });

          savedChapters.push(convertMongoChapter(response.data));
        }

        updateSubjectInCourse(selectedCourseId, selectedSubjectId, (subject) => ({
          ...subject,
          chapters: [...subject.chapters, ...savedChapters],
        }));
      } catch (error) {
        console.error("Error importing chapters:", error);
        showErrorModal("Chapters not imported.");
      }
    });

    event.target.value = "";
  };

 const handleImportTopics = async (event) => {
  if (!hasPermission("canImportTopic")) {
    showWarningModal("You do not have permission to import topics.");
    return;
  }

  const file = event.target.files[0];
  if (!file) return;

  if (!selectedChapterId) {
    showWarningModal("Please select a chapter first.");
    return;
  }

  readExcelFile(file, async (rows) => {
    const importedRows = rows.filter((row) => row.topicName);

    try {
      const savedTopics = [];

      for (const row of importedRows) {
        const topicResponse = await axios.post(`${API_BASE}/topics`, {
          topicName: row.topicName || "",
          chapterId: selectedChapterId,

          theoryMatter: row.theoryMatter || "",
          theoryMatterExplanation: row.theoryMatterExplanation || "",

          mindMap: row.mindMap || "",
          mindMapExplanation: row.mindMapExplanation || "",

          exampleProblemsWithSolution:
            row.exampleProblemsWithSolution || "",
          exampleProblemsExplanation:
            row.exampleProblemsExplanation || "",

          questions: row.questions || "",
          questionsExplanation: row.questionsExplanation || "",

          solution: row.solution || "",
          solutionExplanation: row.solutionExplanation || "",

          relatedTheory: row.relatedTheory || "",
          relatedTheoryExplanation:
            row.relatedTheoryExplanation || "",

          theoryEquation: row.theoryEquation || "",
          explanationEquation: row.explanationEquation || "",
          exampleEquation: row.exampleEquation || "",

          questionEquation: row.questionEquation || "",
          solutionEquation: row.solutionEquation || "",
          relatedTheoryEquation: row.relatedTheoryEquation || "",

          theoryDocuments: [],
          problemDocuments: [],
        });

        savedTopics.push(convertMongoTopic(topicResponse.data));
      }

      updateChapterInSubject(
        selectedCourseId,
        selectedSubjectId,
        selectedChapterId,
        (chapter) => ({
          ...chapter,
          topics: [...chapter.topics, ...savedTopics],
        })
      );
    } catch (error) {
      console.error("Error importing topics:", error);
      showErrorModal("Topics not imported.");
    }
  });

  event.target.value = "";
};

const deleteSubject = async (subjectId) => {
  if (!hasPermission("canRemoveSubject")) {
    showWarningModal("You do not have permission to delete subjects.");
    return;
  }

  openConfirmModal({
  title: "Delete Subject?",
  message:
    "Are you sure you want to delete this subject? Chapters and topics under this subject may also be removed.",
  confirmText: "Delete Subject",
  type: "danger",
  showCancel: true,
  onConfirm: async () => {
      try {
        closeConfirmModal();

        await axios.delete(`${API_BASE}/subjects/${subjectId}`);

        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === selectedCourseId
              ? {
                  ...course,
                  subjects: course.subjects.filter(
                    (subject) => subject.id !== subjectId
                  ),
                }
              : course
          )
        );

        if (selectedSubjectId === subjectId) {
          setSelectedSubjectId(null);
          setSelectedChapterId(null);
          setSelectedTopicId(null);
          setPage("subjects");
        }

        showSuccessModal("Subject deleted successfully.");
      } catch (error) {
        console.error("Error deleting subject:", error);
        showErrorModal("Subject not deleted. Please check backend delete route.");
      }
    },
  });
};

const deleteChapter = async (chapterId) => {
  if (!hasPermission("canRemoveChapter")) {
    showWarningModal("You do not have permission to delete chapters.");
    return;
  }

  openConfirmModal({
    title: "Delete Chapter?",
    message:
      "Are you sure you want to delete this chapter? Topics under this chapter may also be removed.",
    confirmText: "Delete Chapter",
    type: "danger",
    showCancel: true,
    onConfirm: async () => {
      try {
        closeConfirmModal();

        await axios.delete(`${API_BASE}/chapters/${chapterId}`);

        updateSubjectInCourse(selectedCourseId, selectedSubjectId, (subject) => ({
          ...subject,
          chapters: subject.chapters.filter(
            (chapter) => chapter.id !== chapterId
          ),
        }));

        if (selectedChapterId === chapterId) {
          setSelectedChapterId(null);
          setSelectedTopicId(null);
          setPage("chapters");
        }

        showSuccessModal("Chapter deleted successfully.");
      } catch (error) {
        console.error("Error deleting chapter:", error);
        showErrorModal("Chapter not deleted. Please check backend delete route.");
      }
    },
  });
};

const deleteTopic = async (topicId) => {
  if (!hasPermission("canRemoveTopic")) {
    showWarningModal("You do not have permission to delete topics.");
    return;
  }

  openConfirmModal({
    title: "Delete Topic?",
    message: "Are you sure you want to delete this topic?",
    confirmText: "Delete Topic",
    type: "danger",
    showCancel: true,
    onConfirm: async () => {
      try {
        closeConfirmModal();

        try {
          await axios.delete(`${API_BASE}/uploads/topic/${topicId}`);
        } catch (uploadError) {
          console.warn(
            "Topic uploads not deleted or no uploads found:",
            uploadError
          );
        }

        await axios.delete(`${API_BASE}/topics/${topicId}`);

        updateChapterInSubject(
          selectedCourseId,
          selectedSubjectId,
          selectedChapterId,
          (chapter) => ({
            ...chapter,
            topics: chapter.topics.filter((topic) => topic.id !== topicId),
          })
        );

        if (selectedTopicId === topicId) {
          setSelectedTopicId(null);
          setSelectedTopicDirect(null);
          setEditingTopicId(null);
          setPage("topics");
        }

        showSuccessModal("Topic deleted successfully.");
      } catch (error) {
        console.error("Error deleting topic:", error);
        showErrorModal("Topic not deleted. Please check backend delete route.");
      }
    },
  });
};

  const openAddTopicPage = (chapterId) => {
    if (!hasPermission("canAddTopic")) {
      showWarningModal("You do not have permission to add topics.");
      return;
    }

    setSelectedChapterId(chapterId);
    setSelectedTopicId(null);
    setEditingTopicId(null);
    setTopicView("theory");
    setNewTopic(emptyTopicData);
    setPage("addTopic");
  };

  const prepareTopicForEdit = (topic = {}) => {
  return {
    topicName: topic.topicName || "",

    theoryDocuments: topic.theoryDocuments || [],
    problemDocuments: topic.problemDocuments || [],

    theory: {
      matter:
        topic.theory?.matter ||
        topic.theory?.theoryMatter ||
        topic.theoryMatter ||
        "",

      matterExplanation:
        topic.theory?.matterExplanation ||
        topic.theory?.explanation ||
        topic.theory?.theoryExplanation ||
        topic.theoryMatterExplanation ||
        "",

      examples:
        topic.theory?.examples ||
        topic.theory?.exampleProblemsWithSolution ||
        topic.exampleProblemsWithSolution ||
        "",

      examplesExplanation:
        topic.theory?.examplesExplanation ||
        topic.theory?.exampleExplanation ||
        topic.exampleProblemsExplanation ||
        "",

      mindMap:
        topic.theory?.mindMap ||
        topic.mindMap ||
        "",

      mindMapExplanation:
        topic.theory?.mindMapExplanation ||
        topic.mindMapExplanation ||
        "",

      theoryEquation:
        topic.theory?.theoryEquation ||
        topic.theoryEquation ||
        "",

      explanationEquation:
        topic.theory?.explanationEquation ||
        topic.explanationEquation ||
        "",

      exampleEquation:
        topic.theory?.exampleEquation ||
        topic.exampleEquation ||
        "",
    },

    problems: {
      questions:
        topic.problems?.questions ||
        topic.questions ||
        "",

      questionsExplanation:
        topic.problems?.questionsExplanation ||
        topic.questionsExplanation ||
        "",

      solution:
        topic.problems?.solution ||
        topic.solution ||
        "",

      solutionExplanation:
        topic.problems?.solutionExplanation ||
        topic.solutionExplanation ||
        "",

      relatedTheory:
        topic.problems?.relatedTheory ||
        topic.relatedTheory ||
        "",

      relatedTheoryExplanation:
        topic.problems?.relatedTheoryExplanation ||
        topic.relatedTheoryExplanation ||
        "",

      questionEquation:
        topic.problems?.questionEquation ||
        topic.questionEquation ||
        "",

      solutionEquation:
        topic.problems?.solutionEquation ||
        topic.solutionEquation ||
        "",

      relatedTheoryEquation:
        topic.problems?.relatedTheoryEquation ||
        topic.relatedTheoryEquation ||
        "",
    },
  };
};

const openEditTopicPage = async (topicToEdit = null) => {
  if (!hasPermission("canEditTopic")) {
    showWarningModal("You do not have permission to edit topics.");
    return;
  }

  const topicId =
    topicToEdit?.id ||
    topicToEdit?._id ||
    selectedTopic?.id ||
    selectedTopic?._id ||
    selectedTopicId;

  if (!topicId) {
    showErrorModal("Topic data not found for editing.");
    return;
  }

  try {
    const response = await axios.get(`${API_BASE}/topics/single/${topicId}`);
    const convertedTopic = convertMongoTopic(response.data);
    const uploads = await fetchUploadsByTopic(topicId);

    const finalTopic = {
      ...convertedTopic,
      theoryDocuments: uploads.theoryDocuments,
      problemDocuments: uploads.problemDocuments,
    };

    setSelectedTopicId(topicId);
    setEditingTopicId(topicId);
    setSelectedTopicDirect(finalTopic);
    setTopicView("theory");

    editTopicLoadedRef.current = topicId;
    setNewTopic(prepareTopicForEdit(finalTopic));

    setPage("editTopic");
    navigate(`/topics/${topicId}/edit`, { replace: false });
  } catch (error) {
    console.error("Topic fetch failed for edit:", error);
    showErrorModal("Topic data not loaded for editing.");
  }
};

  const updateNewTopicTheory = (field, value) => {
    setNewTopic({
      ...newTopic,
      theory: {
        ...newTopic.theory,
        [field]: value,
      },
    });
  };

  const updateNewTopicProblems = (field, value) => {
    setNewTopic({
      ...newTopic,
      problems: {
        ...newTopic.problems,
        [field]: value,
      },
    });
  };

  const saveTopic = async () => {
  if (!hasPermission("canAddTopic")) {
    showWarningModal("You do not have permission to save topics.");
    return;
  }

  if (!newTopic.topicName.trim()) {
    showWarningModal("Please enter topic name.");
    return;
  }

  try {
    const topicPayload = convertFrontendTopicToMongo(
      newTopic,
      selectedChapterId
    );

    const topicResponse = await axios.post(`${API_BASE}/topics`, topicPayload);

    let finalTopic = convertMongoTopic(topicResponse.data);

const uploads = await saveTopicUploads(
  finalTopic.id,
  newTopic.theoryDocuments,
  newTopic.problemDocuments
);

finalTopic = {
  ...finalTopic,
  theoryDocuments: uploads.theoryDocuments,
  problemDocuments: uploads.problemDocuments,
};

setSelectedTopicDirect(finalTopic);

    setSelectedTopicDirect(finalTopic);

    updateChapterInSubject(
      selectedCourseId,
      selectedSubjectId,
      selectedChapterId,
      (chapter) => ({
        ...chapter,
        topics: [...chapter.topics, finalTopic],
      })
    );

    setSelectedTopicId(finalTopic.id);
    setNewTopic(emptyTopicData);
    setPage("topics");
  } catch (error) {
    console.error("Error saving topic:", error);
    showErrorModal("Topic not saved.");
  }
};

  const saveEditedTopic = async () => {
  if (!hasPermission("canEditTopic")) {
    showWarningModal("You do not have permission to update topics.");
    return;
  }

  if (!newTopic.topicName.trim()) {
    showWarningModal("Please enter topic name.");
    return;
  }

  const topicIdToUpdate = editingTopicId || selectedTopicId;

  if (!topicIdToUpdate) {
    showErrorModal("Topic not found.");
    return;
  }

  try {
    const topicPayload = convertFrontendTopicToMongo(
      newTopic,
      selectedChapterId
    );

    const topicResponse = await axios.put(
      `${API_BASE}/topics/${topicIdToUpdate}`,
      topicPayload
    );

    let updatedTopic = convertMongoTopic(topicResponse.data);

    const uploads = await replaceTopicUploads(
      topicIdToUpdate,
      newTopic.theoryDocuments,
      newTopic.problemDocuments
    );

    updatedTopic = {
      ...updatedTopic,
      theoryDocuments: uploads.theoryDocuments,
      problemDocuments: uploads.problemDocuments,
    };

    setSelectedTopicDirect(updatedTopic);

    updateTopicInChapter(
      selectedCourseId,
      selectedSubjectId,
      selectedChapterId,
      topicIdToUpdate,
      () => updatedTopic
    );

    setSelectedTopicId(topicIdToUpdate);
    setEditingTopicId(null);
    setPage("viewTopic");
    navigate(`/topics/${topicIdToUpdate}/view`, { replace: true });
  } catch (error) {
    console.error("Error updating topic:", error);
    showErrorModal("Topic not updated. Please try again.");
  }
};


const saveRecentlyOpened = (item) => {
  const currentUserId = currentUser?.id || currentUser?._id || "guest";
  const storageKey = `recentlyOpened_${currentUserId}`;

  const oldItems = JSON.parse(localStorage.getItem(storageKey) || "[]");

  const newItem = {
    ...item,
    openedAt: new Date().toISOString(),
  };

  const filteredItems = oldItems.filter(
    (oldItem) => !(oldItem.type === newItem.type && oldItem.id === newItem.id)
  );

  const updatedItems = [newItem, ...filteredItems].slice(0, 10);

  localStorage.setItem(storageKey, JSON.stringify(updatedItems));
};


const openRecentlyOpened = (item) => {
  if (!item?.id || !item?.type) return;

  if (item.type === "topic") {
    navigate(`/topics/${item.id}/view`, { replace: false });
    return;
  }

  if (item.type === "chapter") {
    navigate(`/chapters/${item.id}/topics`, { replace: false });
    return;
  }

  if (item.type === "subject") {
    navigate(`/subjects/${item.id}/chapters`, { replace: false });
    return;
  }

  if (item.type === "course") {
    navigate(`/courses/${item.id}/subjects`, { replace: false });
  }
};

const goBackToTopicsPage = () => {
  const chapterId =
    selectedChapterId ||
    selectedTopic?.chapterId ||
    selectedTopicDirect?.chapterId;

  if (!chapterId) {
    setPage("dashboard");
    navigate("/", { replace: false });
    return;
  }

  setSelectedChapterId(chapterId);
  setSelectedTopicId(null);
  setSelectedTopicDirect(null);
  setEditingTopicId(null);
  setPage("topics");

  navigate(`/chapters/${chapterId}/topics`, { replace: false });
};

if (isAppLoading) {
  return (
    <>
      <div className="loading-page">
        <h2>Loading dashboard...</h2>
        <p>Please wait. Your data is loading from backend.</p>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        type={confirmModal.type}
        showCancel={confirmModal.showCancel}
        onCancel={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
      />
    </>
  );
}


  if (!currentUser) {
  return (
    <>
      <LoginPage
        users={users}
        onLogin={handleLogin}
        apiBase={API_BASE}
        fetchUsers={fetchUsers}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        type={confirmModal.type}
        showCancel={confirmModal.showCancel}
        onCancel={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
      />
    </>
  );
}


  return (
    <div className={`dashboard ${sidebarCollapsed ? "sidebar-mini-mode" : ""}`}>
      <Sidebar
        courses={visibleCourses}
        showCourses={showCourses}
        setShowCourses={setShowCourses}
        showUsers={showUsers}
        setShowUsers={setShowUsers}
        setUsersTab={setUsersTab}
        selectedCourseId={selectedCourseId}
        setSelectedCourseId={setSelectedCourseId}
        setSelectedSubjectId={setSelectedSubjectId}
        setSelectedChapterId={setSelectedChapterId}
        setSelectedTopicId={setSelectedTopicId}
        setPage={setPage}
        handleAddCourse={() => openNameModal("course")}
        courseImportRef={courseImportRef}
        handleImportCourses={handleImportCourses}
        downloadExcelTemplate={downloadExcelTemplate}
        currentUser={currentUser}
        hasPermission={hasPermission}
        handleLogout={handleLogout}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <main className="content-area">
  <div className="top-user-bar">
    <div>
      <p className="small-label">Logged in as</p>
      <h3>
        {currentUser.name}{" "}
        <span className={`role-pill ${currentUser.role}`}>
          {currentUser.role}
        </span>
      </h3>
    </div>

    <button type="button" className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  </div>

  {page === "dashboard" ? (
  <DashboardHome
    courses={visibleCourses}
    users={users}
    currentUser={currentUser}
    openRecentlyOpened={openRecentlyOpened}
  />
) : null}

  {page === "users" && canOpenUsersPage && (
    <UsersPage
      users={users}
      setUsers={setUsers}
      courses={courses}
      setPage={setPage}
      setSelectedCourseId={setSelectedCourseId}
      setSelectedSubjectId={setSelectedSubjectId}
      setSelectedChapterId={setSelectedChapterId}
      setSelectedTopicId={setSelectedTopicId}
      currentUser={currentUser}
      hasPermission={hasPermission}
      usersTab={usersTab}
      setUsersTab={setUsersTab}
      apiBase={API_BASE}
      fetchUsers={fetchUsers}
    />
  )}

  {selectedCourse && page === "subjects" && (
    <SubjectsPage
      selectedCourse={selectedCourse}
      setSelectedSubjectId={setSelectedSubjectId}
      setSelectedChapterId={setSelectedChapterId}
      setSelectedTopicId={setSelectedTopicId}
      setPage={setPage}
      handleAddSubject={() => openNameModal("subject")}
      subjectImportRef={subjectImportRef}
      handleImportSubjects={handleImportSubjects}
      downloadExcelTemplate={downloadExcelTemplate}
      hasPermission={hasPermission}
      deleteSubject={deleteSubject}
      editSubject={openEditSubjectModal}
    />
  )}

  {selectedCourse && selectedSubject && page === "chapters" && (
    <ChaptersPage
      selectedCourse={selectedCourse}
      selectedSubject={selectedSubject}
      setSelectedChapterId={setSelectedChapterId}
      setSelectedTopicId={setSelectedTopicId}
      setPage={setPage}
      handleAddChapter={() => openNameModal("chapter")}
      chapterImportRef={chapterImportRef}
      handleImportChapters={handleImportChapters}
      downloadExcelTemplate={downloadExcelTemplate}
      hasPermission={hasPermission}
      deleteChapter={deleteChapter}
      editChapter={openEditChapterModal}
    />
  )}

  {selectedCourse &&
    selectedSubject &&
    selectedChapter &&
    page === "topics" && (
      <TopicsPage
  selectedCourse={selectedCourse}
  selectedSubject={selectedSubject}
  selectedChapter={selectedChapter}
  setSelectedTopicId={setSelectedTopicId}
  setPage={setPage}
  openAddTopicPage={openAddTopicPage}
  openEditTopicPage={openEditTopicPage}
  topicImportRef={topicImportRef}
  handleImportTopics={handleImportTopics}
  downloadExcelTemplate={downloadExcelTemplate}
  hasPermission={hasPermission}
  deleteTopic={deleteTopic}
  saveRecentlyOpened={saveRecentlyOpened}
/>
    )}

  {page === "viewTopic" && (
    <>
      {!selectedTopic ? (
        <div className="loading-page">
          <h2>Loading topic...</h2>
          <p>Please wait. Topic content is loading.</p>
        </div>
      ) : (
        <TopicViewPage
  selectedChapter={selectedChapter || { chapterName: "Topic" }}
  selectedTopic={selectedTopic}
  topicView={topicView}
  setTopicView={setTopicView}
  setPage={setPage}
  goBackToTopicsPage={goBackToTopicsPage}
  openEditTopicPage={openEditTopicPage}
  hasPermission={hasPermission}
  currentUser={currentUser}
/>
      )}
    </>
  )}

  {(page === "addTopic" || page === "editTopic") && (
    <>
      {page === "editTopic" && !selectedTopic ? (
        <div className="loading-page">
          <h2>Loading topic for edit...</h2>
          <p>Please wait.</p>
        </div>
      ) : (
        <AddEditTopicPage
  page={page}
  selectedCourse={selectedCourse}
  selectedSubject={selectedSubject}
  selectedChapter={selectedChapter}
  newTopic={newTopic}
  setNewTopic={setNewTopic}
  topicView={topicView}
  setTopicView={setTopicView}
  updateNewTopicTheory={updateNewTopicTheory}
  updateNewTopicProblems={updateNewTopicProblems}
  saveTopic={saveTopic}
  saveEditedTopic={saveEditedTopic}
  setPage={setPage}
/>
      )}
    </>
  )}
</main>

      <NameModal
        isOpen={modalOpen}
        title={
  modalType === "course"
    ? "Add New Course"
    : modalType === "subject"
    ? "Add New Subject"
    : modalType === "chapter"
    ? "Add New Chapter"
    : modalType === "editSubject"
    ? "Edit Subject"
    : "Edit Chapter"
}
label={
  modalType === "course"
    ? "Course Name"
    : modalType === "subject" || modalType === "editSubject"
    ? "Subject Name"
    : "Chapter Name"
}
        value={modalValue}
        setValue={setModalValue}
        onSave={handleModalSave}
        onClose={() => setModalOpen(false)}
      />
     <ConfirmModal
  isOpen={confirmModal.isOpen}
  title={confirmModal.title}
  message={confirmModal.message}
  confirmText={confirmModal.confirmText}
  cancelText="Cancel"
  type={confirmModal.type}
  showCancel={confirmModal.showCancel}
  onCancel={closeConfirmModal}
  onConfirm={confirmModal.onConfirm}
/>
    </div>
  );
}

export default App;