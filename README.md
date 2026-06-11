# 🎓 Smart College Resource Sharing Platform

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2+-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3.0+-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

A modern, full-stack, college-centric resource sharing web application designed to facilitate academic collaboration. Students and faculty members can securely upload, search, review, bookmark, and download study materials like PDF notes, lecture presentations, past exam papers, and laboratory manuals.

---

## 🚀 Key Features

*   **🔐 Dual-Role Authentication**: Secure JWT-based authentication with custom flows for **Students** and **Faculty Members**.
*   **📤 Academic Resource Uploads**: Easily share study materials categorized by semester, branch, and resource type.
*   **🔍 Advanced Search & Filter**: Real-time filtering by branch (CSE, IT, ECE, MECH, CIVIL), semester, and content type.
*   **💬 Interactive Peer Lounge**: Real-time chat platform for academic discussion featuring:
    *   **Custom Slash Commands**: Try typing `/shrug` (inserts 🤷‍♂️), `/tableflip` (inserts 🤬 ┻━┻), or `/points` (displays score).
    *   **Image Sharing & Document Previews**: Real-time media attachments.
*   **🏆 Contributor Leaderboard**: Reward-points system that ranks users based on resource downloads and reviews.
*   **🛡️ Moderator Dashboard**: Robust admin interface for auditing, approving, or deleting uploaded materials.
*   **☁️ Cloudinary Storage Integration**: Secure, fast, and optimized cloud hosting for academic files.

---

## 🛠️ Tech Stack

### Backend
*   **Django** & **Django REST Framework** (DRF) — Core RESTful API
*   **SimpleJWT** — Token-based security and session management
*   **dj-database-url** — Dynamic environment-based database configuration
*   **psycopg2-binary** — PostgreSQL database adapter
*   **WhiteNoise** — Optimized static file hosting for production

### Frontend
*   **React** & **Vite** — High-performance build tool and UI library
*   **Tailwind CSS** — Modern styling system
*   **Zustand** — Lightweight and clean global state management
*   **React Query** — Server state sync and caching
*   **React Hot Toast** — Smooth, animated micro-feedback notifications

---

## 📂 Project Structure

```bash
smart-college-resource-sharing-platform/
│
├── backend/                  # Django backend API
│   ├── core/                 # Main settings, routing, and WSGI/ASGI configs
│   ├── users/                # Custom User Model & registration/login API
│   ├── resources/            # Material uploads, search, and download APIs
│   ├── chat/                 # Peer Lounge messaging API
│   ├── reviews/              # Academic review and rating APIs
│   ├── notifications/        # User activity notifications
│   ├── requirements.txt      # Python dependencies list
│   └── manage.py             # Django admin wrapper
│
├── frontend/                 # React frontend client
│   ├── public/               # Static assets
│   ├── src/                  # App components, pages, hooks, api layer, and stores
│   ├── package.json          # Node dependencies list
│   └── vite.config.js        # Vite build config
│
└── README.md                 # Main Documentation
```

---

## 📡 Essential API Endpoints

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `/api/auth/register/` | POST | No | Register a new user |
| `/api/auth/login/` | POST | No | Login and obtain JWT tokens |
| `/api/auth/profile/` | GET/PUT | Yes | Retrieve/update user profile |
| `/api/auth/leaderboard/` | GET | No | Fetch top academic contributors |
| `/api/resources/` | GET | No | List and filter resources |
| `/api/resources/` | POST | Yes | Upload new resource (multipart/form-data) |
| `/api/resources/{id}/bookmark/`| POST | Yes | Toggle bookmark on a resource |
| `/api/chat/` | GET/POST | Yes | Retrieve/send message in Peer Lounge |
| `/api/notifications/` | GET | Yes | Fetch user activity updates |

---

## 🔌 Environment-based Database Configuration

The system is configured to adapt dynamically based on its deployment environment:

*   **Local Development**: Automatically runs on a lightweight, local **SQLite3** database (`db.sqlite3`).
*   **Production Deployment (Render)**: Automatically switches to **PostgreSQL** by reading the environment's `DATABASE_URL` and requiring secure SSL connections.

---

## ⚙️ Local Installation & Setup

### 1. Backend Setup (Django)

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/Shantanu7171/Smart-College-Resource-Sharing-Platform.git
   cd Smart-College-Resource-Sharing-Platform
   ```

2. Enter the backend directory and set up a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `backend/` root directory:
   ```env
   SECRET_KEY=your_secure_development_key
   DEBUG=True
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

5. Run migrations and start the Django server (this automatically configures SQLite for local development):
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

### 2. Frontend Setup (React/Vite)

1. Open a new terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install Node modules:
   ```bash
   npm install
   ```

3. Launch the hot-reloading development server:
   ```bash
   npm run dev
   ```
   The client will be running at `http://localhost:5173`.

---

## 🌐 Production Deployment (Render)

When hosting this platform on **Render**, configure the following:

### 1. Web Service Configuration
*   **Build Command**: `./build.sh` (or `pip install -r requirements.txt && python manage.py collectstatic --no-input`)
*   **Start Command**: `python manage.py migrate && gunicorn core.wsgi:application`
*   **Environment Variables**:
    *   `RENDER` = `true` (This forces Django to switch from SQLite to PostgreSQL)
    *   `DATABASE_URL` = *Your Render PostgreSQL Database URL*
    *   `SECRET_KEY` = *Your production secret key*
    *   `DEBUG` = `False`
    *   *Cloudinary configuration values (as listed above)*

---

## 👨‍💻 Maintainer

**Shantanu Dhabale**
*   🎓 B.E. Information Technology
*   💻 Full Stack Software Engineer | Django, React, REST Architecture, and Web UX

---

## ⭐ Support & Contributions

If you find this project helpful:
*   ⭐ **Star** this repository to show your appreciation.
*   🍴 **Fork** this repository to make improvements.
*   📢 **Share** the platform details with classmates and peers!
