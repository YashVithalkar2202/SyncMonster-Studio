import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  Scissors,
  ArrowLeft,
  Info,
  Layers,
  CheckCircle2,
  Maximize,
} from "lucide-react";
import api from "../api";

const VideoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);
  const [range, setRange] = useState([0, 1]);
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const [segments, setSegments] = useState([]);

  // Production Base URL logic
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (id && id !== "undefined") {
      api
        .get(`/videos/${id}`)
        .then((res) => setVideoData(res.data))
        .catch((err) => console.error("Error fetching video:", err));
    }
  }, [id]);

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setRange([0, videoDuration > 15 ? 15 : videoDuration]);
    }
  };

  const fetchSegments = () => {
    if (id && id !== "undefined") {
      api
        .get(`/videos/${id}/segments`)
        .then((res) => setSegments(res.data))
        .catch((err) => console.log("Segments not ready yet"));
    }
  };

  useEffect(() => {
    if (!id || id === "undefined") return;

    fetchSegments(); // Initial fetch

    // Polling logic optimized for production
    const interval = setInterval(() => {
      fetchSegments();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const handleSliderChange = (val) => {
    setRange(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val[0];
    }
  };

  const handleSplit = async () => {
    setProcessing(true);
    try {
      await api.post(`/videos/${id}/split`, {
        segments: [{ start: range[0], end: range[1] }],
      });
      alert("Neural processing started! Track progress in the gallery below.");
      // Navigate back to workspace to see status update
      navigate("/");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || "Split failed"));
    } finally {
      setProcessing(false);
    }
  };

  if (!videoData)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-grow text-primary" role="status"></div>
      </div>
    );

  return (
    <div
      className="py-4 px-4 min-vh-100"
      style={{ backgroundColor: "#f8fafc" }}
    >
      <div className="container-fluid max-width-xl mx-auto">
        {/* Navigation Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            onClick={() => navigate("/")}
            className="btn btn-white shadow-sm rounded-pill px-4 py-2 d-flex align-items-center border-0 bg-white"
            style={{ color: "#64748b" }}
          >
            <ArrowLeft size={18} className="me-2" /> Back to Workspace
          </button>
          <span
            className="badge bg-indigo-100 text-primary px-3 py-2 rounded-pill border border-primary border-opacity-25"
            style={{ backgroundColor: "#eef2ff" }}
          >
            <Layers size={14} className="me-1" /> Precision Editor Mode
          </span>
        </div>

        <div className="row g-4">
          {/* Main Video Section */}
          <div className="col-xl-8">
            <div
              className="card border-0 shadow-sm overflow-hidden"
              style={{ borderRadius: "24px" }}
            >
              <div
                className="bg-black d-flex align-items-center justify-content-center"
                style={{ minHeight: "450px", backgroundColor: "#000" }}
              >
                <video
                  ref={videoRef}
                  className="w-100 shadow-lg"
                  onLoadedMetadata={onLoadedMetadata}
                  src={
                    videoData.video_url?.startsWith("http")
                      ? videoData.video_url
                      : `${API_BASE_URL}/${videoData.file_path}`
                  }
                  controls
                  controlsList="nodownload"
                  style={{ maxHeight: "500px", borderRadius: "15px" }}
                />
              </div>

              <div className="card-body p-4 bg-white border-top">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                      <Maximize size={20} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">Timeline Selection</h6>
                      <small className="text-muted">
                        Current Range: {range[0].toFixed(1)}s -{" "}
                        {range[1].toFixed(1)}s
                      </small>
                    </div>
                  </div>
                </div>

                {/* Timeline Slider */}
                <div className="px-2 pt-2 pb-4">
                  <Slider
                    range
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={range}
                    onChange={handleSliderChange}
                    trackStyle={[
                      {
                        backgroundColor: "#6366f1",
                        height: 10,
                        borderRadius: "5px",
                      },
                    ]}
                    handleStyle={[
                      {
                        borderColor: "#6366f1",
                        height: 26,
                        width: 26,
                        marginTop: -8,
                        backgroundColor: "#fff",
                        borderWeight: "3px",
                      },
                      {
                        borderColor: "#6366f1",
                        height: 26,
                        width: 26,
                        marginTop: -8,
                        backgroundColor: "#fff",
                        borderWeight: "3px",
                      },
                    ]}
                    railStyle={{
                      backgroundColor: "#f1f5f9",
                      height: 10,
                      borderRadius: "5px",
                    }}
                  />
                  <div className="d-flex justify-content-between mt-2 text-muted small fw-bold">
                    <span>0:00</span>
                    <span>{duration ? duration.toFixed(0) : "0"}s</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-top">
                  <div className="d-flex align-items-center mb-4">
                    <div
                      className="p-2 bg-indigo-100 rounded-3 me-3"
                      style={{ backgroundColor: "#eef2ff" }}
                    >
                      <Layers size={20} className="text-primary" />
                    </div>
                    <h5 className="mb-0 fw-bold">Processed Neural Segments</h5>
                  </div>

                  <div className="row g-3">
                    {segments.length > 0 ? (
                      segments.map((seg) => (
                        <div key={seg.id} className="col-md-6 col-lg-4">
                          <div
                            className="card border-0 shadow-sm h-100 bg-white"
                            style={{
                              borderRadius: "18px",
                              border: "1px solid #edf2f7",
                            }}
                          >
                            <div className="p-2">
                              <video
                                // Production URL handling for segments
                                src={
                                  seg.url?.startsWith("http")
                                    ? seg.url
                                    : `${API_BASE_URL}${seg.url?.startsWith("/") ? "" : "/"}${seg.url}`
                                }
                                className="w-100 rounded-3"
                                style={{
                                  height: "140px",
                                  objectFit: "cover",
                                  backgroundColor: "#000",
                                }}
                              />
                            </div>
                            <div className="card-body pt-0">
                              <div
                                className="text-truncate small fw-bold text-dark mb-3"
                                title={seg.filename}
                              >
                                {seg.filename}
                              </div>
                              <a
                                href={
                                  seg.url?.startsWith("http")
                                    ? seg.url
                                    : `${API_BASE_URL}${seg.url?.startsWith("/") ? "" : "/"}${seg.url}`
                                }
                                download={seg.filename}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2"
                                style={{
                                  backgroundColor: "#eef2ff",
                                  color: "#6366f1",
                                  border: "1px solid #e0e7ff",
                                  fontWeight: "600",
                                }}
                              >
                                Download Clip
                              </a>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12">
                        <div
                          className="text-center py-5 rounded-4 bg-light border-dashed"
                          style={{ border: "2px dashed #e2e8f0" }}
                        >
                          <p className="text-muted mb-0">
                            No segments found yet. Once the engine finishes,
                            your clips will appear here automatically.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-xl-4">
            <div
              className="card border-0 shadow-sm p-4 h-100"
              style={{ borderRadius: "24px" }}
            >
              <div className="d-flex align-items-center mb-4">
                <div className="p-2 bg-light rounded-3 me-3">
                  <Info size={20} className="text-dark" />
                </div>
                <h5 className="mb-0 fw-bold">Asset Details</h5>
              </div>

              <div className="mb-4">
                <label className="small text-muted fw-bold mb-1 d-block">
                  PROJECT TITLE
                </label>
                <p className="fw-bold fs-5 text-dark">{videoData.title}</p>
              </div>

              <div className="p-3 rounded-4 bg-light border mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Selected Duration</span>
                  <span className="text-primary fw-bold">
                    {(range[1] - range[0]).toFixed(2)}s
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Status</span>
                  <span className="badge bg-success bg-opacity-10 text-success border-0 px-2">
                    Ready for Processing
                  </span>
                </div>
              </div>

              <div
                className="alert border-0 rounded-4 d-flex align-items-start gap-3 mb-5"
                style={{ backgroundColor: "#f0fdf4", color: "#166534" }}
              >
                <CheckCircle2 size={18} className="mt-1 flex-shrink-0" />
                <small>
                  Using <b>Direct Stream Copy</b> for instant, lossless video
                  splitting.
                </small>
              </div>

              <button
                className={`btn btn-primary w-100 py-3 rounded-pill shadow-lg border-0 mt-auto d-flex align-items-center justify-content-center gap-2 ${processing ? "disabled" : ""}`}
                onClick={handleSplit}
                disabled={processing || duration === 0}
                style={{
                  backgroundColor: "#6366f1",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                }}
              >
                {processing ? (
                  <>
                    <div className="spinner-border spinner-border-sm"></div>{" "}
                    Running Engine...
                  </>
                ) : (
                  <>
                    <Scissors size={20} /> Process Neural Split
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
