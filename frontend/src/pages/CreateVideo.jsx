import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVideo } from '../api';

const CreateVideo = () => {
  const [formData, setFormData] = useState({ title: '', description: '', video_url: '', duration: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createVideo({ ...formData, duration: parseFloat(formData.duration) });
    navigate('/');
  };

  

  return (
    <div className="row justify-content-center py-5">
      <div className="col-xxl-5 col-xl-6 col-lg-8">
        <div className="card border-0 shadow-2xl p-4" style={{ borderRadius: '30px' }}>
          <div className="card-body p-5">
            <div className="text-center mb-5">
              <span className="display-3">🚀</span>
              <h2 className="fw-bold mt-3">Add New Resource</h2>
              <p className="text-muted">Register an asset to the SyncMonster neural engine.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-4">
                <input type="text" className="form-control border-0 bg-light rounded-4" id="t" placeholder="Title" required 
                       onChange={e => setFormData({...formData, title: e.target.value})} />
                <label htmlFor="t" className="text-muted ms-2">Video Title</label>
              </div>
              <div className="form-floating mb-4">
                <textarea className="form-control border-0 bg-light rounded-4" id="d" style={{ height: '120px' }} placeholder="Desc"
                          onChange={e => setFormData({...formData, description: e.target.value})} />
                <label htmlFor="d" className="text-muted ms-2">Description / Metadata</label>
              </div>
              <div className="form-floating mb-4">
                <input type="url" className="form-control border-0 bg-light rounded-4" id="u" placeholder="URL" required
                       onChange={e => setFormData({...formData, video_url: e.target.value})} />
                <label htmlFor="u" className="text-muted ms-2">Cloud Storage URL (S3/GCP)</label>
              </div>
              <div className="form-floating mb-5">
                <input type="number" className="form-control border-0 bg-light rounded-4" id="dur" placeholder="60" required
                       onChange={e => setFormData({...formData, duration: e.target.value})} />
                <label htmlFor="dur" className="text-muted ms-2">Total Duration (Seconds)</label>
              </div>
              <button type="submit" className="btn btn-primary w-100 py-4 fs-5 fw-bold rounded-pill shadow-lg">
                Submit to Library
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideo;