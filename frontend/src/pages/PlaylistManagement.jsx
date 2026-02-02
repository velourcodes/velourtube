import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { getPlaylistById, updatePlaylist, addVideoToPlaylist, removeVideoFromPlaylist } from '../api/playlist.api';
import { getAllVideos } from '../api/video.api';
import Loader from '../components/common/Loader';
import './PlaylistManagement.css';

const PlaylistManagement = () => {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast, confirmAction } = useFeedback();

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ name: '', description: '' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [availableVideos, setAvailableVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPlaylist();
    }, [playlistId]);

    const fetchPlaylist = async () => {
        try {
            setLoading(true);
            const response = await getPlaylistById(playlistId);
            if (response.data?.data) {
                setPlaylist(response.data.data);
                setEditData({
                    name: response.data.data.name,
                    description: response.data.data.description
                });
            }
        } catch (err) {
            console.error('Failed to load playlist:', err);
            navigate('/my-playlists');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableVideos = async (query = '') => {
        try {
            setVideosLoading(true);
            // Fetch videos based on search query or all published videos
            const response = await getAllVideos({
                limit: 20,
                query: query || searchTerm
            });
            if (response.data?.data?.videos) {
                // Filter out videos already in playlist
                const playlistVideoIds = playlist.videos.map(v => v._id);
                const filtered = response.data.data.videos.filter(
                    v => !playlistVideoIds.includes(v._id)
                );
                setAvailableVideos(filtered);
            }
        } catch (err) {
            console.error('Failed to load videos:', err);
        } finally {
            setVideosLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAvailableVideos(searchTerm);
    };

    const handleUpdatePlaylist = async (e) => {
        e.preventDefault();
        try {
            await updatePlaylist(playlistId, editData);
            setEditMode(false);
            fetchPlaylist();
            showToast('Playlist updated successfully!', 'success');
        } catch (err) {
            console.error('Failed to update playlist:', err);
            showToast('Failed to update playlist. Please try again.', 'error');
        }
    };

    const handleAddVideo = async (videoId) => {
        try {
            await addVideoToPlaylist(playlistId, videoId);
            setShowAddModal(false);
            fetchPlaylist();
            showToast('Video added to playlist', 'success');
        } catch (err) {
            console.error('Failed to add video:', err);
            showToast('Failed to add video to playlist.', 'error');
        }
    };

    const handleRemoveVideo = async (videoId, videoTitle) => {
        confirmAction({
            title: 'Remove Video',
            message: `Remove "${videoTitle}" from this playlist?`,
            confirmText: 'Remove',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await removeVideoFromPlaylist(playlistId, videoId);
                    showToast('Video removed from playlist', 'success');
                    fetchPlaylist();
                } catch (err) {
                    console.error('Failed to remove video:', err);
                    showToast('Failed to remove video from playlist.', 'error');
                }
            }
        });
    };

    const handleOpenAddModal = () => {
        setShowAddModal(true);
        setSearchTerm('');
        fetchAvailableVideos('');
    };

    if (loading) return <Loader />;
    if (!playlist) return null;

    return (
        <div className="playlist-management-container">
            <div className="playlist-header-section">
                <button className="btn-text back-btn" onClick={() => navigate('/my-playlists')}>
                    ← Back to Playlists
                </button>

                {editMode ? (
                    <form onSubmit={handleUpdatePlaylist} className="edit-form">
                        <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="edit-input-title"
                            required
                        />
                        <textarea
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="edit-input-desc"
                            rows={3}
                            required
                        />
                        <div className="edit-actions">
                            <button type="button" className="btn-text" onClick={() => setEditMode(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary-small">
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <h1>{playlist.name}</h1>
                        <p className="playlist-desc">{playlist.description}</p>
                        <div className="header-actions">
                            <button className="btn-secondary" onClick={() => setEditMode(true)}>
                                Edit Details
                            </button>
                            <button className="btn-primary" onClick={handleOpenAddModal}>
                                + Add Videos
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="playlist-videos-section">
                <h2>{playlist.videos.length} Videos</h2>
                {playlist.videos.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎬</div>
                        <h3>No videos in this playlist</h3>
                        <p>Add videos to get started</p>
                        <button className="btn-primary-small" onClick={handleOpenAddModal}>
                            Add Videos
                        </button>
                    </div>
                ) : (
                    <div className="videos-list">
                        {playlist.videos.map((video, index) => (
                            <div key={video._id} className="video-item">
                                <div className="video-index">{index + 1}</div>
                                <img
                                    src={video.thumbnail?.secure_url}
                                    alt={video.title}
                                    className="video-thumbnail-small"
                                />
                                <div className="video-details">
                                    <h4>{video.title}</h4>
                                    <p>{video.views} views</p>
                                </div>
                                <button
                                    className="btn-text remove-btn"
                                    onClick={() => handleRemoveVideo(video._id, video.title)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Videos Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <h2>Add Videos to Playlist</h2>

                        <form onSubmit={handleSearch} className="modal-search-form">
                            <input
                                type="text"
                                placeholder="Search all videos by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="modal-search-input"
                            />
                            <button type="submit" className="btn-primary-small">Search</button>
                        </form>

                        {videosLoading ? (
                            <div className="modal-loader">Loading available videos...</div>
                        ) : availableVideos.length === 0 ? (
                            <p className="no-videos-msg">No more videos available to add</p>
                        ) : (
                            <div className="available-videos-list">
                                {availableVideos.map((video) => (
                                    <div key={video._id} className="available-video-item">
                                        <img
                                            src={video.thumbnail?.secure_url || video.thumbnailURL}
                                            alt={video.title}
                                            className="video-thumbnail-small"
                                        />
                                        <div className="video-details">
                                            <h4>{video.title}</h4>
                                        </div>
                                        <button
                                            className="btn-primary-small"
                                            onClick={() => handleAddVideo(video._id)}
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="btn-text close-modal" onClick={() => setShowAddModal(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaylistManagement;
