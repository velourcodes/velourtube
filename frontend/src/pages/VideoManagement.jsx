import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVideoById, updateVideoById, deleteVideo, togglePublishStatus } from '../api/video.api';
import { useFeedback } from '../context/FeedbackContext';
import Loader from '../components/common/Loader';
import './VideoManagement.css';

const VideoManagement = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const { showToast, confirmAction } = useFeedback();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [video, setVideo] = useState(null);
    const [preview, setPreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchVideo();
    }, [videoId]);

    const fetchVideo = async () => {
        try {
            setLoading(true);
            const response = await getVideoById(videoId);
            if (response.data?.data) {
                const data = response.data.data;
                setVideo(data);
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                });
                setPreview(data.thumbnailURL || data.thumbnail?.secure_url);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to load video details', 'error');
            navigate('/my-videos');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            if (thumbnailFile) {
                data.append('thumbnail', thumbnailFile);
            }

            await updateVideoById(videoId, data);
            showToast('Video updated successfully!', 'success');
            navigate(`/video/${videoId}`);
        } catch (err) {
            console.error(err);
            showToast('Update failed. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTogglePublish = async () => {
        try {
            setSubmitting(true);
            await togglePublishStatus(videoId);
            const newStatus = !video.isPublished ? 'Published' : 'Private';
            showToast(`Video is now ${newStatus}`, 'success');
            navigate(`/video/${videoId}`);
        } catch (err) {
            console.error(err);
            showToast('Failed to toggle visibility status', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        confirmAction({
            title: 'Delete Video',
            message: 'Are you ABSOLUTELY sure? This action cannot be undone and your content will be lost forever.',
            confirmText: 'Delete Permanently',
            type: 'danger',
            onConfirm: async () => {
                try {
                    setSubmitting(true);
                    await deleteVideo(videoId);
                    showToast('Video deleted successfully', 'success');
                    navigate('/my-videos');
                } catch (err) {
                    console.error(err);
                    showToast('Deletion failed', 'error');
                    setSubmitting(false);
                }
            }
        });
    };

    if (loading) return <Loader />;

    return (
        <div className="management-container">
            <div className="management-header">
                <button className="back-link" onClick={() => navigate('/my-videos')}>
                    ← Back to My Videos
                </button>
                <h1>Manage "{video.title}"</h1>
            </div>

            <div className="management-content">
                <div className="main-editor">
                    <form onSubmit={handleSubmit} className="editor-form">
                        <div className="form-group">
                            <label>Video Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter a catchy title"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows="8"
                                placeholder="Tell viewers about your video"
                            />
                        </div>

                        <div className="thumbnail-editor">
                            <label>Thumbnail Update</label>
                            <div
                                className="thumbnail-upload-box"
                                onClick={() => fileInputRef.current.click()}
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="img-preview" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <span>📸 Update Thumbnail</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handleThumbnailChange}
                                    accept="image/*"
                                />
                            </div>
                        </div>

                        <div className="form-submit-actions">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                className="btn-text"
                                onClick={() => navigate(`/video/${videoId}`)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                <div className="danger-zone">
                    <div className="zone-card toggle-published">
                        <h3>Visibility</h3>
                        <p>Currently: <strong>{video.isPublished ? 'Public' : 'Private'}</strong></p>
                        <button
                            className={`status-btn ${video.isPublished ? 'make-private' : 'make-public'}`}
                            onClick={handleTogglePublish}
                            disabled={submitting}
                        >
                            {video.isPublished ? '🛡️ Set to Private' : '✨ Publish Video'}
                        </button>
                    </div>

                    <div className="zone-card danger">
                        <h3>Danger Zone</h3>
                        <p>Once you delete a video, there is no going back.</p>
                        <button
                            className="delete-btn"
                            onClick={handleDelete}
                            disabled={submitting}
                        >
                            🗑️ Delete Permanently
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoManagement;
