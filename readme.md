# 🎥 SyncMonster Studio

**SyncMonster Studio** is a professional-grade video asset management platform. It allows users to manage video workflows, track processing statuses, and perform video splitting operations. Built with a robust **FastAPI** backend and a high-fidelity **React** dashboard, it features secure **JWT Authentication** and real-time status simulations.

![image alt](https://github.com/YashVithalkar2202/SyncMonster-Studio/blob/main/image.png)


![image alt](https://github.com/YashVithalkar2202/SyncMonster-Studio/blob/81322072eea901e56be5504c6054e8d508dbe8fc/Screenshot%20from%202026-02-14%2023-42-38.png)


## 🛠️ Tech Stack

* **Frontend:** React (Vite), Bootstrap 5, Axios, React Router.
* **Backend:** Python 3.12, FastAPI, SQLAlchemy ORM, Pydantic.
* **Security:** JWT (JSON Web Tokens) with Bcrypt password hashing.
* **Database:** MySQL.
* **Testing:** Pytest.

---

## 🚀 Setup & Installation

### 1. Prerequisites

* Python 3.10+
* Node.js & npm
* MySQL Server

### 2. Database Setup

1. Open your MySQL terminal or workbench.
2. Create the database:
```sql
CREATE DATABASE Video_processing;

```


3. The application uses SQLAlchemy to automatically generate tables on the first run.

### 3. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend

```


2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

```


3. Install dependencies:
```bash
pip install -r requirements.txt

```


4. Run the server:
```bash
uvicorn main:app --reload

```



### 4. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend

```


2. Install dependencies:
```bash
npm install

```


3. Run the development server:
```bash
npm run dev

```



---

## 🔐 Authentication

The system is secured using JWT. To access the dashboard and editor:

* **Default Username:** `admin`
* **Default Password:** `password123`

---

## 🧪 How to Run Tests

The project includes unit tests for core backend logic and API endpoints.

1. Ensure you are in the `backend` directory with the virtual environment active.
2. Run the tests:
```bash
pytest

```



---

## 📖 API Documentation

FastAPI provides interactive documentation out of the box. Once the backend is running, you can explore the endpoints, request schemas, and test the API directly:

* **Swagger UI:** [http://localhost:8000/docs](https://www.google.com/search?q=http://localhost:8000/docs)
* **Redoc:** [http://localhost:8000/redoc](https://www.google.com/search?q=http://localhost:8000/redoc)

### Key Endpoints:

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/token` | Login and get JWT access token | No |
| `GET` | `/videos/` | Get all videos (Search/Pagination) | No |
| `POST` | `/videos/` | Create a new video asset | **Yes** |
| `PATCH` | `/videos/{id}` | Update video metadata | **Yes** |
| `POST` | `/videos/{id}/split` | Process video splitting | **Yes** |

---

## 📁 Project Structure

```text
SyncMonster-Studio/
├── backend/
│   ├── routes/         # API Route definitions
│   ├── services/       # Video processing logic
│   ├── auth.py         # JWT & Security logic
│   ├── main.py         # Entry point & CORS
│   └── models.py       # SQLAlchemy Database Models
├── frontend/
│   ├── src/
│   │   ├── pages/      # View components
│   │   ├── api.js      # Axios interceptors & API calls
│   │   └── App.jsx     # Protected routes logic
└── README.md

```

---

**Developed for the NeuralGarage Software Developer Assignment.**

---
