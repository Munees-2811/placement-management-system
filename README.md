# Student Placement Management System (MERN)

A full-stack web application built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js) designed to manage campus placements, recruitment drives, student applications, and placement officer operations.

---

## 🛠️ Technology Stack

- **Frontend**:
  - **React.js** (scaffolded via **Vite**)
  - **Tailwind CSS** for responsive styling and dark mode UI
  - **Axios** (configured with interceptors for JWT token injection)
  - **React Router (v7)** for client-side routing
  - **Lucide React** for modern iconography

- **Backend**:
  - **Node.js** & **Express.js** (ES Modules)
  - **MongoDB** with **Mongoose ODM**
  - **JSON Web Token (JWT)** for stateless authentication
  - **bcryptjs** for secure password hashing and verification
  - **CORS** & **dotenv** for cross-origin management and environment configuration

---

## 📁 Project Folder Structure

```
placement-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection logic via Mongoose
│   │   ├── controllers/
│   │   │   └── authController.js     # User registration, login, and profile fetching
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js     # JWT verification & role authorization guards
│   │   │   └── errorMiddleware.js    # 404 Route Not Found & centralized error handling
│   │   ├── models/
│   │   │   └── User.js               # User schema with bcrypt pre-save hash & methods
│   │   ├── routes/
│   │   │   └── authRoutes.js         # /api/auth routes (register, login, me)
│   │   ├── app.js                    # Express application setup, middlewares, & routes
│   │   └── server.js                 # HTTP listener bootstrap & DB initialization
│   ├── .env                          # Local environment variables
│   ├── .env.example                  # Environment template
│   ├── .gitignore                    # Ignored files (node_modules, .env, etc.)
│   └── package.json                  # Backend scripts and dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Centralized Axios instance with bearer token auth
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Navbar.jsx        # Responsive navigation with auth-aware links
│   │   │       └── ProtectedRoute.jsx# Client-side route protection component
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global authentication state (user, token, login, logout)
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing page explaining roles & features
│   │   │   ├── Login.jsx             # User sign-in interface
│   │   │   ├── Register.jsx          # User registration interface with role selection
│   │   │   └── Dashboard.jsx         # Protected user dashboard & API health test
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx         # Application routing structure
│   │   ├── App.css                   # Component-level styles
│   │   ├── App.jsx                   # Application root with context providers
│   │   ├── index.css                 # Tailwind CSS directives and base styles
│   │   └── main.jsx                  # React DOM mount point
│   ├── .env                          # Local frontend environment variables
│   ├── .env.example                  # Frontend environment template
│   ├── .gitignore                    # Frontend gitignore
│   ├── index.html                    # HTML entry point with metadata
│   ├── package.json                  # Frontend scripts and dependencies
│   └── vite.config.js                # Vite configuration with Tailwind CSS plugin
│
└── README.md                         # Project documentation
```

---

## 🚀 Getting Started & Running Independently

The frontend and backend are completely decoupled and can be run independently in separate terminal windows.

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: A running local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI.

---

### 2. Backend Setup & Execution

Open a terminal and navigate to the `backend/` directory:

```bash
cd backend
```

#### Install dependencies:
```bash
npm install
```

#### Configure Environment Variables:
A `.env` file is already created for local development. You can customize the settings in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/placement_management_db
JWT_SECRET=supersecretjwtkey_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### Run the Backend:
- **Development mode (auto-restart with nodemon)**:
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```
The backend API will start at: `http://localhost:5000`
- Health check endpoint: `http://localhost:5000/api/health`

---

### 3. Frontend Setup & Execution

Open a second terminal and navigate to the `frontend/` directory:

```bash
cd frontend
```

#### Install dependencies:
```bash
npm install
```

#### Configure Environment Variables:
The `frontend/.env` file points to the backend API:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

#### Run the Frontend:
- **Start Vite development server**:
  ```bash
  npm run dev
  ```
- **Build production bundle**:
  ```bash
  npm run build
  ```
- **Preview production build**:
  ```bash
  npm run preview
  ```

Open your browser and navigate to: `http://localhost:5173`

---

## 🔐 Authentication & API Reference

### Available Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Service health status check | Public |
| `POST` | `/api/auth/register` | Register new user (student, tpo, company, admin) | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Protected (Bearer Token) |

### Supported User Roles
- `STUDENT` (Student Candidate)
- `PLACEMENT_OFFICER` (Placement Liaison / TPO)
- `ADMIN` (System Administrator)

---

## 🏢 Company Management Module

### Overview
The **Company Management Module** allows placement departments to manage enterprise recruiters, corporate partnerships, campus recruitment contacts, and hiring guidelines.

### Role-Based Access Control (RBAC) Matrix

| Operation | HTTP Route | Access Level | Description |
|---|---|---|---|
| **List Companies** | `GET /api/companies` | `STUDENT`, `PLACEMENT_OFFICER`, `ADMIN` | View and search all partner companies |
| **View Company** | `GET /api/companies/:id` | `STUDENT`, `PLACEMENT_OFFICER`, `ADMIN` | View full details, contacts, and overview |
| **Create Company** | `POST /api/companies` | `PLACEMENT_OFFICER`, `ADMIN` **Only** | Register a new partner company |
| **Edit Company** | `PUT /api/companies/:id` | `PLACEMENT_OFFICER`, `ADMIN` **Only** | Update company profile and contact details |
| **Delete Company** | `DELETE /api/companies/:id` | `PLACEMENT_OFFICER`, `ADMIN` **Only** | Remove company from placement directory |

*Note: Students have strict read-only access. Attempting to create, edit, or delete companies results in a `403 Forbidden` response.*

### Company Fields & Schema

- **`companyName`** *(String, Required, Indexed)*: Unique official corporate name (2 - 120 characters).
- **`industry`** *(String, Required)*: Industry or business domain (e.g., Software & Cloud, Fintech, Automotive).
- **`location`** *(String, Required)*: Primary corporate/campus office or recruitment location.
- **`website`** *(String, Optional)*: Official website URL with automated prefix formatting and regex validation.
- **`description`** *(String, Optional)*: Detailed profile of company, work culture, and recruitment overview (up to 2000 characters).
- **`contactPerson`** *(String, Required)*: Primary HR or university recruitment liaison.
- **`contactEmail`** *(String, Required)*: Validated corporate email address of contact person.
- **`createdBy`** *(ObjectId Ref)*: Identifier of the admin or officer who registered the company.
- **`createdAt` / `updatedAt`** *(Timestamps)*: Automatic Mongoose timestamps.

### Frontend Features

- **Responsive Company Directory (`/companies`)**:
  - Live instantaneous search by company name, location, or keywords.
  - Industry categorization dropdown filter.
  - Dual layout options: **Interactive Grid Cards** and **Data-Dense Table View**.
  - Metric counters: Total Partner Companies, Industries Represented, and Recruitment Hubs.
- **Role-Aware UI Adaptation**:
  - **Officer / Admin View**: Displays `+ Add Company` action, row edit/delete triggers, and direct edit shortcuts.
  - **Student View**: Informative banner indicating read-only access, hides all mutating controls, provides direct contact person inspection and website links.
- **Company Modal (`CompanyModal.jsx`)**:
  - Pre-filled edit mode and fresh creation mode.
  - Live client-side validation with real-time error messages, URL tester, and character countdown (0 / 2000).
- **Detail Inspection Modal (`CompanyDetailModal.jsx`)**:
  - Deep inspection modal with company monogram, industry tags, one-click email copying, and visit link.
- **Safe Deletion (`DeleteConfirmModal.jsx`)**:
  - Explicit confirmation modal displaying company information before permanent removal.
