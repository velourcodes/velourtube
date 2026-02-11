import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { getVideoById, getAllVideos } from '../api/video.api';
import { getUserPlaylists, addVideoToPlaylist, removeVideoFromPlaylist } from '../api/playlist.api';
import { toggleVideoLike, toggleCommentLike } from '../api/like.api';
import { toggleSubscription } from '../api/subscription.api';
import { getVideoComments, addComment, updateComment, deleteComment } from '../api/comment.api';
import { getRelativeTime, getDateFromId } from '../utils/timeUtils';
import VideoCard from '../components/common/VideoCard';
import Loader from '../components/common/Loader';
import './VideoView.css';

const VideoView = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast, confirmAction } = useFeedback();

    const [video, setVideo] = useState(null);
    const [recommendedVideos, setRecommendedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Engagement State
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribersCount, setSubscribersCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    // Playlist Modal State
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);
    const [playlistMessage, setPlaylistMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (videoId) {
            fetchVideoData();
            fetchRecommendedVideos();
            fetchComments();
        }
    }, [videoId]);

    const fetchVideoData = async () => {
        try {
            setLoading(true);
            const response = await getVideoById(videoId);
            if (response.data?.data) {
                const videoData = response.data.data;
                setVideo(videoData);
                // Strict mapping for "perfect" backend
                setIsLiked(videoData.isLikedByUser !== undefined ? videoData.isLikedByUser : (videoData.isLiked || false));
                setLikesCount(videoData.videoLikeCount !== undefined ? videoData.videoLikeCount : (videoData.likesCount || 0));

                setIsSubscribed(videoData.isSubscribed === true);
                setSubscribersCount(videoData.subscribersCount || 0);
            }
        } catch (err) {
            setError('Failed to load video');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await getVideoComments(videoId);
            if (response.data?.data?.currentPageComments) {
                setComments(response.data.data.currentPageComments);
            } else {
                setComments([]);
            }
        } catch (err) {
            console.error('Failed to load comments', err);
            setComments([]);
        }
    };

    const fetchRecommendedVideos = async () => {
        try {
            const response = await getAllVideos({ limit: 10 });
            if (response.data?.data?.videos) {
                setRecommendedVideos(response.data.data.videos);
            }
        } catch (err) {
            console.error('Failed to load recommended videos', err);
        }
    };

    const handleVideoLike = async () => {
        if (!user) return navigate('/login');

        try {
            // Optimistic Update
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

            await toggleVideoLike(videoId);
        } catch (err) {
            console.error("Like toggle failed", err);
            // Revert on error
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        }
    };

    const handleToggleSubscription = async () => {
        if (!user) return navigate('/login');
        if (!video?.ownerId) return;

        try {
            // Optimistic Update
            setIsSubscribed(!isSubscribed);
            setSubscribersCount(prev => isSubscribed ? prev - 1 : prev + 1);

            await toggleSubscription(video.ownerId);
        } catch (err) {
            console.error("Subscription toggle failed", err);
            // Revert on error
            setIsSubscribed(!isSubscribed);
            setSubscribersCount(prev => isSubscribed ? prev - 1 : prev + 1);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        if (!commentText.trim()) return;

        try {
            setCommentLoading(true);
            const response = await addComment({ videoId, content: commentText });
            if (response.data?.success) {
                setCommentText('');
                fetchComments();
            }
        } catch (err) {
            console.error("Failed to add comment", err);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleCommentLike = async (commentId) => {
        if (!user) return navigate('/login');
        try {
            await toggleCommentLike(commentId);
            fetchComments(); // Refresh to get new like counts
        } catch (err) {
            console.error("Comment like failed", err);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editText.trim()) return;
        try {
            await updateComment(commentId, { content: editText });
            setEditingCommentId(null);
            setEditText('');
            fetchComments();
        } catch (err) {
            console.error("Edit failed", err);
        }
    };

    const handleDeleteComment = (commentId) => {
        confirmAction({
            title: 'Delete Comment',
            message: 'Are you sure you want to delete this comment?',
            confirmText: 'Delete',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await deleteComment(commentId);
                    fetchComments();
                    showToast('Comment deleted', 'success');
                } catch (err) {
                    console.error("Delete failed", err);
                    showToast('Failed to delete comment', 'error');
                }
            }
        });
    };

    const fetchUserPlaylists = async () => {
        if (!user?._id) return;
        try {
            setPlaylistsLoading(true);
            const response = await getUserPlaylists(user._id);
            if (response.data?.data?.playlists) {
                setUserPlaylists(response.data.data.playlists);
            }
        } catch (err) {
            console.error('Failed to load playlists', err);
        } finally {
            setPlaylistsLoading(false);
        }
    };

    const handleSaveClick = () => {
        if (!user) return navigate('/login');
        setShowPlaylistModal(true);
        fetchUserPlaylists();
    };

    const handlePlaylistToggle = async (playlistId, isVideoInPlaylist) => {
        try {
            setPlaylistMessage({ text: 'Updating...', type: 'info' });
            if (isVideoInPlaylist) {
                await removeVideoFromPlaylist(playlistId, videoId);
                setPlaylistMessage({ text: 'Removed from playlist', type: 'success' });
            } else {
                await addVideoToPlaylist(playlistId, videoId);
                setPlaylistMessage({ text: 'Added to playlist', type: 'success' });
            }
            // Refresh playlists to update state
            fetchUserPlaylists();

            // Clear message after 2 seconds
            setTimeout(() => setPlaylistMessage({ text: '', type: '' }), 2000);
        } catch (err) {
            console.error('Failed to update playlist', err);
            setPlaylistMessage({ text: 'Failed to update playlist', type: 'error' });
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatViews = (views) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toString();
    };


    if (loading) {
        return <Loader />;
    }

    if (error || !video) {
        return (
            <div className="error-container">
                <p className="error-message">{error || 'Video not found'}</p>
                <button className="btn-primary" onClick={() => navigate('/videos')}>
                    Back to Videos
                </button>
            </div>
        );
    }

    const isVideoOwner = user?._id && video?.ownerId && String(user._id) === String(video.ownerId);
    const videoDate = video.createdAt || getDateFromId(video._id);

    return (
        <div className="video-view-container">
            <div className="video-main-section">
                <div className="video-player-wrapper">
                    <video
                        className="video-player"
                        controls
                        autoPlay
                        src={video.videoFile || video.videoFileURL}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="video-details">
                    <h1 className="video-title">{video.title}</h1>

                    <div className="video-stats">
                        <span>{formatViews(video.views)} views • {getRelativeTime(videoDate)}</span>
                        <div className="video-actions">
                            <button
                                className={`action-btn like-btn ${isLiked ? 'active' : ''}`}
                                onClick={handleVideoLike}
                            >
                                <span className="icon">{isLiked ? '❤️' : '🤍'}</span>
                                <span className="count">{formatViews(likesCount || 0)}</span>
                                {isLiked ? 'Liked' : 'Like'}
                            </button>
                            <button className="action-btn">📤 Share</button>
                            <button className="action-btn" onClick={handleSaveClick}>💾 Save</button>
                        </div>
                    </div>

                    <div className="channel-info-section">
                        <div className="channel-details">
                            <div className="channel-avatar-wrapper">
                                {video.ownerAvatarURL ? (
                                    <img
                                        src={video.ownerAvatarURL}
                                        alt={video.ownerUsername}
                                        className="channel-avatar"
                                        onClick={() => navigate(`/channel/${video.ownerUsername}`)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ) : (
                                    <div className="avatar-placeholder">👤</div>
                                )}
                            </div>
                            <div className="channel-text">
                                <div className="channel-meta">
                                    <h3
                                        className="channel-name"
                                        onClick={() => navigate(`/channel/${video.ownerUsername}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {video.ownerUsername}
                                    </h3>
                                </div>
                                <p className="sub-count">{subscribersCount} subscribers</p>
                            </div>
                        </div>
                        {!isVideoOwner && (
                            <button
                                className={`btn-primary subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
                                onClick={handleToggleSubscription}
                            >
                                {isSubscribed ? 'Subscribed' : 'Subscribe'}
                            </button>
                        )}
                    </div>

                    <div className="video-description-section">
                        <p className="video-description">{video.description}</p>
                        <div className="divider"></div>
                    </div>

                    <div className="comments-section">
                        <h3 className="comments-title">{comments.length} Comments</h3>

                        <form onSubmit={handleAddComment} className="comment-input-wrapper">
                            <div className="user-avatar-small">
                                {user?.avatar?.secure_url || user?.avatarURL ? (
                                    <img src={user.avatar?.secure_url || user.avatarURL} alt="You" />
                                ) : (
                                    <div className="avatar-placeholder-small">👤</div>
                                )}
                            </div>
                            <div className="comment-input-container">
                                <input
                                    type="text"
                                    className="comment-input"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={commentLoading}
                                />
                                {commentText && (
                                    <div className="comment-input-actions">
                                        <button
                                            type="button"
                                            className="btn-text"
                                            onClick={() => setCommentText('')}
                                        >Cancel</button>
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={commentLoading}
                                        >Comment</button>
                                    </div>
                                )}
                            </div>
                        </form>

                        <div className="comments-list">
                            {comments.map((comment) => {
                                // Handcrafting mapping to match "perfect" but inconsistent backend projections
                                const author = comment.ownerUsername || 'User';
                                const avatar = comment.ownerAvatarURL || comment.owner?.avatarSecureURL;

                                const createdAt = comment.createdAt || getDateFromId(comment._id);
                                const currentLikesCount = comment.commentLikeCount || 0;
                                const currentIsLiked = comment.isLikedByUser || false;

                                const commentOwnerId = comment.ownerId || comment.owner?._id || comment.owner || comment.commenterId;
                                const isCommentOwner = user?._id && commentOwnerId && String(user._id) === String(commentOwnerId);
                                const canManage = isCommentOwner || isVideoOwner;

                                return (
                                    <div key={comment._id} className="comment-card">
                                        <div
                                            className="comment-avatar"
                                            onClick={() => navigate(`/channel/${author}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {avatar ? (
                                                <img src={avatar} alt={author} />
                                            ) : (
                                                <div className="avatar-placeholder-small">👤</div>
                                            )}
                                        </div>
                                        <div className="comment-content">
                                            <div className="comment-header">
                                                <span
                                                    className="comment-author"
                                                    onClick={() => navigate(`/channel/${author}`)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    @{author}
                                                </span>
                                                <span className="comment-time">{getRelativeTime(createdAt)}</span>
                                            </div>

                                            {editingCommentId === comment._id ? (
                                                <div className="comment-edit-form">
                                                    <input
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        className="edit-input"
                                                        autoFocus
                                                    />
                                                    <div className="edit-actions">
                                                        <button onClick={() => setEditingCommentId(null)} className="btn-text">Cancel</button>
                                                        <button onClick={() => handleEditComment(comment._id)} className="btn-primary">Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="comment-text">{comment.content}</p>
                                            )}

                                            <div className="comment-actions">
                                                <button
                                                    className={`comment-action like-btn ${currentIsLiked ? 'liked' : ''}`}
                                                    onClick={() => handleCommentLike(comment._id)}
                                                >
                                                    {currentIsLiked ? '❤️' : '🤍'} {currentLikesCount}
                                                </button>
                                                <button className="comment-action">Reply</button>

                                                {canManage && editingCommentId !== comment._id && (
                                                    <div className="owner-actions">
                                                        {isCommentOwner && (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCommentId(comment._id);
                                                                    setEditText(comment.content);
                                                                }}
                                                                className="comment-action-btn"
                                                            >Edit</button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteComment(comment._id)}
                                                            className="comment-action-btn delete"
                                                        >Delete</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="recommended-section">
                <h3 className="recommended-title">Recommended</h3>
                <div className="recommended-list">
                    {recommendedVideos.map((recVideo) => (
                        <VideoCard key={recVideo._id} video={recVideo} type="list" />
                    ))}
                </div>
            </div>

            {/* Save to Playlist Modal */}
            {showPlaylistModal && (
                <div className="modal-overlay" onClick={() => setShowPlaylistModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Save to playlist</h2>
                            <button className="close-btn" onClick={() => setShowPlaylistModal(false)}>✕</button>
                        </div>

                        {playlistMessage.text && (
                            <div className={`playlist-message ${playlistMessage.type}`}>
                                {playlistMessage.text}
                            </div>
                        )}

                        {playlistsLoading ? (
                            <div className="modal-loader">Loading playlists...</div>
                        ) : userPlaylists.length === 0 ? (
                            <div className="empty-playlists">
                                <p>You haven't created any playlists yet.</p>
                                <button
                                    className="btn-primary"
                                    onClick={() => navigate('/my-playlists')}
                                >
                                    Go to My Playlists
                                </button>
                            </div>
                        ) : (
                            <div className="playlists-check-list">
                                {userPlaylists.map((playlist) => {
                                    const isVideoInPlaylist = playlist.videos?.includes(videoId);
                                    return (
                                        <div key={playlist._id} className="playlist-check-item">
                                            <label className="checkbox-container">
                                                <input
                                                    type="checkbox"
                                                    checked={isVideoInPlaylist}
                                                    onChange={() => handlePlaylistToggle(playlist._id, isVideoInPlaylist)}
                                                />
                                                <span className="checkmark"></span>
                                                <span className="playlist-label-name">{playlist.name}</span>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="modal-actions-centered">
                            <button
                                className="btn-text"
                                onClick={() => navigate('/my-playlists')}
                            >
                                + Create new playlist
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoView;
