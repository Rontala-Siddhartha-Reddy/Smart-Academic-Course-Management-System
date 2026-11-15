
# 🎓 Smart Academic Course Management System

### Dynamic Access and Responsibility Control

**A MERN Stack-based academic management platform with role-based access control, dynamic staff permissions, structured learning materials, and multilingual digital lecture support.**

## 📌 Project Overview

The Smart Academic Course Management System is a web-based application developed to simplify academic content management in educational institutions.

The system provides separate dashboards for Administrators, Staff, and Students, allowing each user to access academic resources according to their assigned roles and permissions.

The main objective is to provide a secure, flexible, and organized platform where academic information can be managed efficiently.

### Key Highlights

- Three role-based dashboards
- Dynamic permission management
- Course and subject allocation
- Structured academic content management
- Study material creation and editing
- Student view-only access
- Digital blackboard lecture interface
- Multilingual learning support
- Text-to-speech functionality

---

## 🎯 Problem Statement

Educational institutions manage multiple courses, subjects, students, teachers, and learning materials.

However, managing different access levels can become challenging.

### Major Problems

- Different users require different levels of access.
- Teachers may need different permissions depending on their responsibilities.
- Unauthorized users should not modify academic content.
- Students should have controlled access to learning resources.
- Academic information needs to be organized into a clear structure.

### Our Solution

Our system provides **Role-Based Access Control with Dynamic Permissions**.

The Admin determines which academic resources users can access and which actions they are authorized to perform.

This improves academic organization, access management, and security.

---

## ✨ Key Features

### 1. Role-Based Login System

The application provides a common login interface for three user roles:

- Admin
- Staff
- Student

After login, users are directed to their respective dashboards.

### 2. Admin Dashboard

Admin has complete management access.

Main responsibilities include:

- Manage students and staff.
- Add, update, and delete academic resources.
- Allocate courses and subjects.
- Assign permissions to staff members.
- Control access to study materials.

### 3. Staff Dashboard

Staff members can access assigned academic resources.

Features include:

- View assigned courses and subjects.
- Access related topics and study materials.
- Add or edit materials when authorized.
- Perform only Admin-approved operations.

### 4. Student Dashboard

Students have view-only academic access.

Features include:

- View assigned courses.
- Access subjects and topics.
- Read available study materials.
- Access lecture-related learning features.

Students cannot modify academic information.

### 5. Dynamic Permission Management

The Admin can assign different permissions to different staff members.

For example:

- Teacher A can add study materials.
- Teacher B can edit assigned topics.
- Teacher C can only view learning content.

**Course allocation controls what a user can see, while permissions control what a user can do.**

### 6. Structured Academic Navigation

The application follows this structure:

Dashboard → Course → Subject → Topic → Study Material

This makes academic content easier to organize, manage, and access.

### 7. Academic Content Management

The application supports organized learning content through:

- Course management
- Subject management
- Chapter and topic management
- Theory content
- Problem-based content
- Study material uploads

### 8. Multilingual Digital Lecture

The project includes a digital lecture interface intended to improve the learning experience.

The lecture-related modules include:

- Blackboard-style content presentation
- Topic-based learning explanations
- Translation-related functionality
- Text-to-speech processing
- Python-based speech processing support

These features are designed to support accessible and interactive learning.

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React.js, JavaScript |
| Frontend Build Tool | Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| API Communication | REST APIs |
| Speech Processing | Python |
| Version Control | Git and GitHub |

---

## 🏗️ System Architecture

The application follows a three-layer architecture.

### Frontend Layer

Developed using React.js.

Responsible for:

- Login interface
- User dashboards
- Academic navigation
- Content display
- Editing interfaces
- Lecture interface

### Backend Layer

Developed using Node.js and Express.js.

Responsible for:

- API request handling
- User-related operations
- Academic content management
- Role and permission logic
- Database communication
- Translation and audio-related endpoints

### Database Layer

MongoDB stores application data such as:

- Users
- Courses
- Subjects
- Chapters
- Topics
- Theory content
- Problems
- Upload records

### Application Data Flow

1. The user enters login details.
2. The frontend sends a request to the backend.
3. The backend processes the request and identifies the user.
4. The appropriate dashboard is displayed.
5. The user selects an available course.
6. Related subjects, chapters, and topics are retrieved.
7. The application determines which operations are authorized.
8. Relevant academic information is displayed.

---

## 📂 Project Structure

```text
course-dashboard/
│
├── public/
│
├── server/
│   ├── models/
│   │   ├── Chapter.js
│   │   ├── Course.js
│   │   ├── Problem.js
│   │   ├── Subject.js
│   │   ├── Theory.js
│   │   ├── Topic.js
│   │   ├── Upload.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── chapterRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── problemRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── theoryRoutes.js
│   │   ├── topicRoutes.js
│   │   ├── translateRoutes.js
│   │   ├── ttsRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── server.js
│   ├── tts_worker.py
│   ├── package.json
│   └── package-lock.json
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

---

# ⚙️ Installation and Setup

## Prerequisites

Before running this project, install:

1. Node.js and npm
2. MongoDB Community Server
3. Python, if required for speech processing
4. Git
5. A code editor such as Visual Studio Code

## Step 1: Clone the Repository

Open PowerShell or Command Prompt.

```bash
git clone https://github.com/Rontala-Siddhartha-Reddy/Smart-Academic-Course-Management-System.git
```

Navigate to the project directory:

```bash
cd Smart-Academic-Course-Management-System
```

## Step 2: Install Frontend Dependencies

From the main project folder, run:

```bash
npm install
```

This installs the required React and Vite dependencies.

## Step 3: Install Backend Dependencies

Move into the backend folder:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

## Step 4: Configure MongoDB

The application uses MongoDB for storing academic information.

Ensure MongoDB Community Server is installed.

Configure the backend MongoDB connection using the settings expected by the application.

If the backend requires environment variables, create a local `server/.env` file with the appropriate values.

Never commit passwords, secret keys, or `.env` files to GitHub.

---

# ▶️ How to Run the Project

**Important: Start the application in this order:**

1. MongoDB
2. Backend Server
3. Frontend React Application

Keep all three terminal windows open while using the application.

## Step 1: Start MongoDB

Open PowerShell.

For a Windows installation using MongoDB Server 8.0 at its default location, run:

```powershell
& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
```

Use the actual MongoDB installation path if your version or installation directory is different.

If MongoDB is already running as a Windows service, it does not need to be started a second time.

Expected message:

```text
Waiting for connections
```

This indicates that MongoDB is ready for database connections.

## Step 2: Start the Backend Server

Open a second terminal.

Navigate to the cloned project's backend folder:

```bash
cd Smart-Academic-Course-Management-System/server
```

If you are already in the backend folder, skip the navigation command.

Start the backend:

```bash
npx nodemon server.js
```

Expected output for the project's documented local configuration:

```text
MongoDB connected successfully
Server running on port 5000
```

### Backend Test URL

Open:

http://localhost:5000/api/courses

This endpoint can be used to check whether the backend is responding.

The response depends on the application's data and access configuration.

## Step 3: Start the Frontend

Open a third terminal.

Navigate to the main project folder.

Run:

```bash
npm run dev
```

Vite should display a local development URL, usually:

```text
http://localhost:5173/
```

Open the URL in your browser.

The Smart Academic Course Management System should now be accessible locally.

**Note:** If port 5173 is occupied, Vite may display another port. Always use the URL printed in the terminal.

---

## 🛑 How to Stop the Project

When you finish using the application:

1. Open each running terminal.
2. Press `Ctrl + C`.
3. Confirm with `Y` if prompted.
4. Close the terminal windows.

Your saved academic data remains in MongoDB unless it is explicitly deleted.

---

## ✅ Application Startup Checklist

Before opening the website, verify:

- MongoDB is running.
- The backend server is running.
- The backend has connected to MongoDB.
- The frontend Vite development server is running.
- The browser is using the correct local URL.

---

## 🔧 Common Problems and Solutions

### Problem 1: Frontend is not displaying data

**Possible cause:** MongoDB or the backend server is not running.

**Solution:**

- Check that MongoDB is running.
- Check the backend terminal for errors.
- Restart the backend if necessary.
- Refresh the browser.

### Problem 2: MongoDB connection failed

**Possible cause:** Database service is not running or connection settings are incorrect.

**Solution:**

1. Start MongoDB.
2. Verify the connection configuration.
3. Restart the backend:

```bash
npx nodemon server.js
```

### Problem 3: Frontend is using a different port

**Possible cause:** Port 5173 is already occupied.

**Solution:**

Use the local URL displayed in the terminal after running:

```bash
npm run dev
```

### Problem 4: `mongod` is not recognized

**Possible cause:** MongoDB is not configured in the system PATH.

**Solution:**

Run the MongoDB executable using its complete installation path.

### Problem 5: Academic data is not appearing

**Solution:**

1. Verify MongoDB is running.
2. Check backend connectivity.
3. Test the course API endpoint.
4. Check whether the database contains academic records.
5. Refresh the frontend application.

A fresh installation may require valid initial user and course data before the dashboard displays useful information.

### Problem 6: Dependencies are missing

**Solution:**

Install frontend dependencies:

```bash
npm install
```

Then install backend dependencies:

```bash
cd server
npm install
```

Restart the application.

---

## 📋 Software Project Management Methodology

The project follows an iterative and modular development approach.

### Phase 1: Requirement Analysis

- Identify user requirements.
- Define Admin, Staff, and Student responsibilities.
- Identify access restrictions and academic operations.

### Phase 2: System Design

- Design the application architecture.
- Define database models.
- Plan academic navigation.
- Design user dashboards.

### Phase 3: Development

- Develop React frontend components.
- Implement backend APIs.
- Create MongoDB data models.
- Implement user and permission-related functionality.

### Phase 4: Integration

- Connect frontend and backend.
- Integrate database operations.
- Integrate academic content and user modules.
- Connect learning-related components.

### Phase 5: Testing

- Check login and role-based navigation.
- Verify course and subject access.
- Test allowed and restricted operations.
- Check data retrieval and editing.
- Test application integration.

### Phase 6: Documentation

- Prepare project documentation.
- Prepare system architecture diagrams.
- Create the final SPM presentation.
- Document installation and startup instructions.

---

## 🚀 Future Scope

Possible future enhancements include:

- Attendance management
- Online examinations
- Assignment submissions
- Student performance analytics
- Progress tracking
- Advanced multilingual lectures
- Additional voice and language options
- Integration with institutional systems
- Expanded access-control capabilities

---

## 👥 Team Members

| Name | Contribution |
|------|--------------|
| K Raghavendar | Requirement Analysis and Administration |
| Rontala Siddhartha Reddy | Frontend Development and Navigation |
| Konda Suryaprakash Goud | Backend and Access Control |
| G Aravind | Database and Content Management |

### Shared Contributions

- Requirement discussions
- System design
- Module integration
- Testing and debugging
- Documentation
- Project presentation

---

## 🎓 Academic Information

**Project:** Smart Academic Course Management System

**Subtitle:** Dynamic Access and Responsibility Control

**Course:** Software Project Management (SPM)

**Institution:** Indian Institute of Information Technology Vadodara

**Year:** 2026

---

## 🏁 Conclusion

The Smart Academic Course Management System provides a flexible approach to managing academic information through structured navigation, role-based dashboards, and dynamic permission control.

It supports administrators in managing users and academic resources, enables teachers to work with authorized content, and provides students with access to assigned learning materials.

The project also incorporates digital lecture and multilingual learning concepts to enhance the academic experience.

**The main focus of this project is organized academic management, flexible user permissions, and accessible learning.**
