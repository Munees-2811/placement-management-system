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
- `student` (default)
- `tpo` (Training & Placement Officer)
- `company` (Recruiter)
- `admin` (System Administrator)
