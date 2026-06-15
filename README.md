# EduVault | Student Management System

EduVault is a modern, responsive full-stack **Student Management System** developed as a Technical Assessment for the Junior Full Stack Developer position. It is built using **React**, **Node.js (Express)**, **PostgreSQL**, and styled with **Tailwind CSS**.

The application features a dark-themed glassmorphic design and incorporates advanced options like server-side pagination, database-driven unique admission code generation, real-time activity auditing, and an administrative statistics panel.

---

## 🚀 Key Features

- **Full Student Lifecycle**: Add, View, Edit/Update details, and Drop (Delete) student profiles.
- **Unique Admission Code**: Auto-generated sequential ID codes format: `ADM-YYYY-XXXXX` (e.g., `ADM-2026-00001`).
- **Profile Photo Uploads**: Local file storage of student profile photos with automated filesystem unlinking upon deletion or replacements.
- **Dynamic Database Search & Filters**: Search students by name/email/admission number, or filter by course department, academic year, and gender.
- **Server-Side Pagination**: Highly performant listings driven by PostgreSQL `LIMIT` and `OFFSET` queries.
- **Activity Log Audit Trail**: Real-time auditing that records all creation, update, deletion, and seed events.
- **Responsive Dashboard Analytics**: Integrated department loading metrics, gender ratios, academic levels, and system status charts.
- **Premium CSS/Tailwind Styling**: Dark layouts, backdrop blurs, animated toast notifications, custom confirmation modals, and micro-interactions.

---

## 🧰 Technology Stack

### Frontend
- **Framework**: React (Vite SPA template)
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Build Tool**: Vite 5

### Backend
- **Runtime**: Node.js
- **Server**: Express.js
- **File Uploads**: Multer
- **Validation**: Express-Validator
- **Environment**: Dotenv

### Database
- **Engine**: PostgreSQL (pg client pool)
- **Indexing**: Custom indexing on fields: `name`, `course`, `year`, and log `timestamp`

---

## 🛠️ Setup & Execution Instructions

Follow these steps to run the application locally.

### 📋 Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** server running locally (port `5432` by default)

---

### 1. Database Setup
Create a PostgreSQL database named `student_management`.
Using terminal:
```bash
createdb student_management
```
*Note: The backend is programmed with an **automatic database migration and seed routine**. Upon launching, it will automatically connect, generate all tables (`students` and `activity_logs`), configure indices, and seed 5 initial records.*

---

### 2. Backend Server Setup
1. Open the `/backend` folder.
2. Initialize backend dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables inside `.env` (a template is provided below):
   ```env
   PORT=5001
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=aaryarastogi
   DB_PASSWORD=
   DB_NAME=student_management
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm run start
   ```
   *The server will boot on port `5001` and verify the tables.*

---

### 3. Frontend React App Setup
1. Open the `/frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the address:
   ```
   http://localhost:5173/
   ```

---

## 🔌 API Endpoints Reference

All student endpoints correspond to: `http://localhost:5001`

| Method | Endpoint | Description | Query Parameters / Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/students` | Fetch paginated & filtered students | `page` (int), `limit` (int), `search` (string), `course` (string), `year` (int), `gender` (string) |
| **GET** | `/students/analytics` | Fetch metrics and audit log stream | None |
| **GET** | `/students/:id` | Fetch specific student details by ID | None |
| **POST**| `/students` | Register new student record | Multipart Form-Data (Fields + `photo` file) |
| **PUT** | `/students/:id` | Update student profile | Multipart Form-Data (Fields + `photo` file) |
| **DELETE**| `/students/:id` | Drop student from registry | None |

---

## 📂 Project Directory Structure

```
studentManagement/
├── backend/
│   ├── config/
│   │   └── db.js            # DB connection, migrations, seeding
│   ├── controllers/
│   │   └── studentController.js # CRUD, searching, analytics, logs
│   ├── middleware/
│   │   ├── upload.js        # Multer image uploading config
│   │   └── validation.js    # express-validator schemas
│   ├── routes/
│   │   └── studentRoutes.js # Route mappings
│   ├── uploads/             # Stores uploaded images
│   ├── .env                 # Server env variables
│   ├── package.json
│   └── server.js            # Express entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── StudentDetails.jsx
│   │   │   ├── StudentForm.jsx
│   │   │   └── StudentTable.jsx
│   │   ├── App.jsx          # Coordinates layout states & API integration
│   │   ├── index.css        # Tailwind style base & glass panels
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```
