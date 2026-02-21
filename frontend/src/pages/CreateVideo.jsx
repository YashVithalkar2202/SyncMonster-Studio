import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; 

const CreateVideo = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a video file");
      return;
    }

    // Production Check: Cloudinary free tier supports up to 100MB usually
    if (selectedFile.size > 100 * 1024 * 1024) {
      alert("File is too large. Please upload a video under 100MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", selectedFile);

    try {
      await api.post("/videos/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      // yash: Important to reset state on failure
      setIsUploading(false);
      setUploadProgress(0);
      alert("Upload failed. " + (err.response?.data?.detail || "Please try again."));
    }
  };

  return (
    <div className="row justify-content-center py-5 animate__animated animate__fadeIn">
      <div className="col-xxl-5 col-xl-6 col-lg-8">
        <div className="card border-0 shadow-2xl p-4" style={{ borderRadius: '30px', backgroundColor: '#ffffff' }}>
          <div className="card-body p-5">
            <div className="text-center mb-5">
              <span className="display-3">🚀</span>
              <h2 className="fw-bold mt-3">Upload Video</h2>
              <p className="text-muted">Your video will be stored securely on Cloudinary.</p>
            </div>

            <form onSubmit={handleSubmit}>
              
              <div className="form-floating mb-4">
                <input
                  type="text"
                  className="form-control border-0 bg-light rounded-4"
                  placeholder="Title"
                  required
                  disabled={isUploading}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label className="text-muted ms-2">Video Title</label>
              </div>

              <div className="form-floating mb-4">
                <textarea
                  className="form-control border-0 bg-light rounded-4"
                  style={{ height: '120px' }}
                  placeholder="Description"
                  disabled={isUploading}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <label className="text-muted ms-2">Description</label>
              </div>

              <div className="mb-5">
                <label className="form-label fw-bold">Select Video File</label>
                <input
                  type="file"
                  className="form-control border-0 bg-light rounded-3 p-3"
                  accept="video/*"
                  required
                  disabled={isUploading}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <small className="text-muted mt-2 d-block">Max size: 100MB (MP4, MOV, MKV)</small>
              </div>

              {isUploading && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold text-primary">Uploading to Cloud...</span>
                    <span className="fw-bold text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="progress" style={{ height: '12px', borderRadius: '10px' }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                      role="progressbar"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`btn btn-primary w-100 py-4 fs-5 fw-bold rounded-pill shadow-lg border-0 ${isUploading ? 'disabled' : ''}`}
                disabled={isUploading}
                style={{ backgroundColor: '#6366f1' }}
              >
                {isUploading ? 'Processing...' : 'Upload Video'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideo;