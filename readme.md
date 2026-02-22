# 🎥 SyncMonster Studio: Neural Video Engine

![image alt](https://github.com/YashVithalkar2202/SyncMonster-Studio/blob/main/image.png)

![image alt](https://github.com/YashVithalkar2202/SyncMonster-Studio/blob/81322072eea901e56be5504c6054e8d508dbe8fc/Screenshot%20from%202026-02-14%2023-42-38.png)

![image alt](https://github.com/YashVithalkar2202/SyncMonster-Studio/blob/cc7025cd7422ccc5bfa4839081e59bd83c73a410/Screenshot%20from%202026-02-22%2023-34-09.png)


SyncMonster Studio is a professional-grade video asset management and processing platform.  
Built for high-performance workflows, it enables users to upload real video assets, perform frame-accurate splitting using FFmpeg, and manage cloud-based storage.

The studio features a high-fidelity Modern Glassmorphism dashboard with real-time processing status updates.

---

## ✨ Key Features

### 🎬 Real Video Processing
- Uses **FFmpeg** for lossless, high-speed video splitting via Direct Stream Copy.
- Frame-accurate trimming without re-encoding.

### ☁️ Hybrid Storage
- Dual-mode storage:
  - Local Filesystem
  - Cloudinary Cloud Storage
- Scalable and production-ready architecture.

### 🎞️ Neural Timeline Editor
- Precision range-slider for selecting exact cut points.
- Real-time video scrubbing.

### ⚙️ Background Processing
- Powered by **FastAPI BackgroundTasks**
- Heavy video processing runs without freezing UI.

### 🖼️ Live Gallery
- Auto-polling gallery.
- Displays processed segments instantly after generation.

### 📤 Upload Tracker
- Real-time upload progress bar.
- Implemented using Axios interceptors.

### 🔐 Security
- JWT Authentication
- Bcrypt password hashing
- Secure asset management

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Bootstrap 5
- Axios
- Lucide Icons
- rc-slider

### Backend
- Python 3.12
- FastAPI
- SQLAlchemy ORM
- Pydantic v2

### Media Engine
- FFmpeg (Native Binary)
- ffmpeg-python

### Storage
- Cloudinary API
- Local Filesystem Storage

### Database
- MySQL / PostgreSQL

---

## 🚀 Setup & Installation

### 1️⃣ Prerequisites

- Python 3.10+
- Node.js
- FFmpeg installed on system path

```bash
sudo apt install ffmpeg
````

* MySQL Server (or PostgreSQL)

---

### 2️⃣ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
DATABASE_URL=mysql+pymysql://user:password@localhost/Video_processing
SECRET_KEY=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

### 3️⃣ Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

### 4️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 📖 API Workflow

| Method | Endpoint                | Description                                                  |
| ------ | ----------------------- | ------------------------------------------------------------ |
| POST   | `/videos/`              | Upload video (Multipart/Form-Data) & trigger Cloudinary sync |
| POST   | `/videos/{id}/split`    | Start background FFmpeg range cutting task                   |
| GET    | `/videos/{id}/segments` | Fetch all processed clips                                    |
| GET    | `/videos/`              | Paginated video library with status tracking                 |

---

## 📁 Project Structure

```
SyncMonster-Studio/
├── backend/
│   ├── routes/          # API Endpoints (Upload, Split, Gallery)
│   ├── services/        # FFmpeg engine & Split logic
│   ├── uploads/         # Local storage for assets
│   ├── auth.py          # JWT Security logic
│   └── models.py        # SQLAlchemy Models
│
├── frontend/
│   ├── src/
│   │   ├── pages/       # VideoDetails (Editor), CreateVideo (Upload)
│   │   └── api.js       # Axios instance
│
└── README.md
```

---

## 🧠 Architecture Highlights

* Clean separation of services & routes
* Background video processing
* Cloud-first scalable design
* Real-time UI feedback loops
* Secure authentication layer

---

## 👨‍💻 Developed For

NeuralGarage Software Developer Assignment

---

## ❤️ Author

Developed with ❤️ by **Yash Vithalkar**

---

## 📜 License

This project is for evaluation and assignment purposes.


