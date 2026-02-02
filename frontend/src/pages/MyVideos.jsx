import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChannelVideos } from '../api/dashboard.api';
import VideoCard from '../components/common/VideoCard';
import Loader from '../components/common/Loader';
import './MyVideos.css';

const MyVideos = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?._id) {
            fetchMyVideos();
        }
    }, [user]);

    const fetchMyVideos = async () => {
        try {
            setLoading(true);
            const response = await getChannelVideos();
            // Backend returns: data: [channelVideos, pagination]
            if (response.data?.data && Array.isArray(response.data.data)) {
                setVideos(response.data.data[0] || []);
            }
            setError('');
        } catch (err) {
            setError('Failed to load your videos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="my-videos-page-container">
            <div className="my-videos-header-premium">
                <h1 className="gradient-text">My Videos</h1>
                {videos.length > 0 && (
                    <div className="my-videos-meta-animated">
                        <span className="count-badge">{videos.length}</span>
                        <span className="count-text">videos published</span>
                    </div>
                )}
                <div className="header-actions">
                    <button className="btn-primary-glass" onClick={() => navigate('/dashboard')}>
                        Analytics
                    </button>
                    <button className="btn-primary-solid" onClick={() => navigate('/upload')}>
                        Upload New
                    </button>
                </div>
            </div>

            <div className="my-videos-content">
                {videos.length === 0 ? (
                    <div className="empty-state-premium">
                        <div className="empty-icon-animated">🎬</div>
                        <h3>Your stage is empty</h3>
                        <p>Share your creative journey with the Velour Verse community.</p>
                        <button className="btn-primary-small" onClick={() => navigate('/upload')}>
                            Upload First Video
                        </button>
                    </div>
                ) : (
                    <div className="my-videos-grid">
                        {videos.map((video) => (
                            <div key={video._id} className="manage-card-wrapper">
                                <VideoCard video={video} />
                                <div className="manage-actions">
                                    <button
                                        className="btn-secondary-small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/manage-video/${video._id}`);
                                        }}
                                    >
                                        ⚙️ Edit Details
                                    </button>
                                    {!video.isPublished && (
                                        <span className="status-badge private">Private</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyVideos;
