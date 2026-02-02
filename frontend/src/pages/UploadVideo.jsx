import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { publishAVideo } from '../api/video.api';
import './UploadVideo.css';

const UploadVideo = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });

    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [videoPreviewName, setVideoPreviewName] = useState('');

    const videoInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('video/')) {
                setVideoFile(file);
                setVideoPreviewName(file.name);
                setError('');
            } else {
                setError('Please select a valid video file.');
            }
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setThumbnailFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setThumbnailPreview(reader.result);
                reader.readAsDataURL(file);
                setError('');
            } else {
                setError('Please select a valid image file for the thumbnail.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile || !thumbnailFile) {
            setError('Please select both a video file and a thumbnail.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('videoFile', videoFile);
            data.append('thumbnail', thumbnailFile);

            const response = await publishAVideo(data);

            if (response.data?.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/my-videos');
                }, 2000);
            }
        } catch (err) {
            console.error("Upload failed:", err);
            setError(err.response?.data?.message || 'Failed to upload video. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="upload-success-container">
                <div className="success-card">
                    <div className="success-icon">✅</div>
                    <h2>Upload Successful!</h2>
                    <p>Your video is being processed and will be available shortly.</p>
                    <p>Redirecting you to your videos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="upload-page-container">
            <div className="upload-header">
                <h1 className="gradient-text">Upload New Video</h1>
                <p>Share your creative journey with the Velour Verse community.</p>
            </div>

            <form className="upload-form" onSubmit={handleSubmit}>
                <div className="upload-layout">
                    {/* File Selection Area */}
                    <div className="upload-files-section">
                        <div
                            className={`file-drop-zone video-zone ${videoFile ? 'has-file' : ''}`}
                            onClick={() => videoInputRef.current.click()}
                        >
                            <input
                                type="file"
                                hidden
                                ref={videoInputRef}
                                accept="video/*"
                                onChange={handleVideoChange}
                            />
                            <div className="zone-content">
                                <div className="zone-icon">📹</div>
                                {videoFile ? (
                                    <div className="file-info">
                                        <p className="file-name">{videoPreviewName}</p>
                                        <p className="change-text">Click to change video</p>
                                    </div>
                                ) : (
                                    <>
                                        <h3>Select Video File</h3>
                                        <p>Drag and drop or click to browse</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="thumbnail-selection-wrapper">
                            <label>Video Thumbnail</label>
                            <div
                                className={`file-drop-zone thumbnail-zone ${thumbnailPreview ? 'has-preview' : ''}`}
                                onClick={() => thumbnailInputRef.current.click()}
                            >
                                <input
                                    type="file"
                                    hidden
                                    ref={thumbnailInputRef}
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                />
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="Thumbnail preview" className="thumb-preview-img" />
                                ) : (
                                    <div className="zone-content">
                                        <div className="zone-icon small">🖼️</div>
                                        <p>Select Thumbnail</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Area */}
                    <div className="upload-details-section">
                        {error && <div className="upload-error-alert">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter a descriptive title"
                                required
                                maxLength={100}
                            />
                            <small className="char-count">{formData.title.length}/100</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Tell viewers about your video"
                                required
                                rows={8}
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className={`btn-primary upload-submit-btn ${loading ? 'btn-loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Publishing...' : 'Publish Video'}
                            </button>
                            <button
                                type="button"
                                className="btn-text"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>

                        {loading && (
                            <div className="upload-progress-info">
                                <div className="progress-spinner"></div>
                                <p>Uploading to cloud storage. This may take a minute...</p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UploadVideo;
