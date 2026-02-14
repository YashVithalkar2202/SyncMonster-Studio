import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVideo, splitVideo } from '../api';

const VideoDetails = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [segments, setSegments] = useState([{ start: 0, end: 10 }]);
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getVideo(id).then(res => setVideo(res.data));
  }, [id]);

//   const handleSplit = async () => {
//     setIsProcessing(true);
//     try {
//       const res = await splitVideo(id, segments);
//       setResults(res.data.segments);
//       const updated = await getVideo(id);
//       setVideo(updated.data);
//     } catch (err) {
//       alert("Processing Error: " + (err.response?.data?.detail || "Check timestamps"));
//       const updated = await getVideo(id);
//       setVideo(updated.data);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

const handleSplit = async () => {
  // 1. Frontend par simulation shuru karein
  setIsProcessing(true);
  
  // Hum video object ko local state mein "Processing" set kar dete hain 
  // taaki UI turant update ho jaye backend call se pehle
  setVideo(prev => ({ ...prev, status: 'Processing' }));

  // 2. Artificial wait (3 seconds) taaki user ko "Processing" spinner dikhe
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const res = await splitVideo(id, segments);
    setResults(res.data.segments);
    
    // Success hone par backend se latest "Ready" status le aayenge
    const updated = await getVideo(id);
    setVideo(updated.data);
  } catch (err) {
    // Agar backend error deta hai (invalid segments), toh local UI ko "Failed" dikhayenge
    setVideo(prev => ({ ...prev, status: 'Failed' }));
    alert("Processing Error: " + (err.response?.data?.detail || "Check timestamps"));
  } finally {
    setIsProcessing(false);
  }
};

  if (!video) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="w-100 animate__animated animate__fadeIn">
      <div className="row g-5">
        {/* Left Side: Asset Info */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '25px' }}>
            <div className="card-body p-5 text-center">
              <div className="display-1 mb-4">📹</div>
              <h2 className="fw-bold mb-3">{video.title}</h2>
              <span className={`badge rounded-pill px-4 py-2 mb-4 fs-6 ${video.status === 'Ready' ? 'bg-success' : video.status === 'Failed' ? 'bg-danger' : 'bg-primary'}`}>
                {video.status}
              </span>
              <div className="text-start bg-light p-4 rounded-4 shadow-sm border">
                <p className="mb-2"><strong>Duration:</strong> {video.duration}s</p>
                <p className="mb-0 text-muted small text-break"><strong>Path:</strong> {video.video_url}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Logic & Splitter */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: '25px' }}>
            <div className="card-header bg-dark text-white p-4" style={{ borderTopLeftRadius: '25px', borderTopRightRadius: '25px' }}>
              <h4 className="mb-0 fw-bold">Processing Workflow</h4>
            </div>
            <div className="card-body p-5">
              {video.status === 'Failed' && (
                <div className="alert alert-danger border-0 shadow-sm mb-4">
                  <strong>❌ Split Failed:</strong> One or more segments exceed the video length or are formatted incorrectly.
                </div>
              )}

              <h5 className="mb-4 fw-bold text-secondary">Define Segments</h5>
              {segments.map((s, i) => (
                <div key={i} className="row g-3 mb-4 align-items-end">
                  <div className="col-md-5">
                    <label className="form-label small fw-bold text-muted">START TIME (S)</label>
                    <input type="number" className="form-control form-control-lg bg-light" value={s.start} 
                           onChange={e => { const n = [...segments]; n[i].start = parseFloat(e.target.value); setSegments(n); }} />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label small fw-bold text-muted">END TIME (S)</label>
                    <input type="number" className="form-control form-control-lg bg-light" value={s.end} 
                           onChange={e => { const n = [...segments]; n[i].end = parseFloat(e.target.value); setSegments(n); }} />
                  </div>
                </div>
              ))}

              {(isProcessing || video.status === 'Processing') ? (
                <button className="btn btn-primary btn-lg w-100 py-3 rounded-pill disabled shadow-none">
                  <span className="spinner-border spinner-border-sm me-3"></span>
                  Processing Engine Active...
                </button>
              ) : (
                <button className="btn btn-primary btn-lg w-100 py-3 rounded-pill shadow fw-bold" onClick={handleSplit}>
                  Initialize Video Split ⚡
                </button>
              )}
            </div>
          </div>

          {results && (
            <div className="card border-0 shadow-lg bg-success text-white" style={{ borderRadius: '25px' }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">✅ Output Generated Successfully</h5>
                <ul className="mb-0 list-unstyled">
                  {results.map(r => (
                    <li key={r.segment_id} className="bg-white text-dark p-3 rounded-4 mb-2 shadow-sm d-flex justify-content-between">
                      <strong>Segment #{r.segment_id}</strong>
                      <code className="text-primary">{r.url}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;