import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // make sure this is your axios instance

const CreateVideo = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a video file");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", selectedFile);

    try {
      await api.post("/videos/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="row justify-content-center py-5">
      <div className="col-xxl-5 col-xl-6 col-lg-8">
        <div className="card border-0 shadow-2xl p-4" style={{ borderRadius: '30px' }}>
          <div className="card-body p-5">
            <div className="text-center mb-5">
              <span className="display-3">🚀</span>
              <h2 className="fw-bold mt-3">Upload Video</h2>
              <p className="text-muted">Upload a video file to the backend server.</p>
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* Title */}
              <div className="form-floating mb-4">
                <input
                  type="text"
                  className="form-control border-0 bg-light rounded-4"
                  placeholder="Title"
                  required
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label className="text-muted ms-2">Video Title</label>
              </div>

              {/* Description */}
              <div className="form-floating mb-4">
                <textarea
                  className="form-control border-0 bg-light rounded-4"
                  style={{ height: '120px' }}
                  placeholder="Description"
                  onChange={(e) => setDescription(e.target.value)}
                />
                <label className="text-muted ms-2">Description</label>
              </div>

              {/* File Upload */}
              <div className="mb-5">
                <label className="form-label fw-bold">Select Video File</label>
                <input
                  type="file"
                  className="form-control"
                  accept="video/*"
                  required
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-4 fs-5 fw-bold rounded-pill shadow-lg"
              >
                Upload Video
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideo;
