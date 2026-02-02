import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWatchHistory } from '../api/user.api';
import VideoCard from '../components/common/VideoCard';
import Loader from '../components/common/Loader';
import './WatchHistory.css';

const WatchHistory = () => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWatchHistory();
    }, []);

    const fetchWatchHistory = async () => {
        try {
            setLoading(true);
            const response = await getWatchHistory();
            if (response.data?.data) {
                setVideos(response.data.data);
            }
        } catch (err) {
            setError('Failed to load watch history');
            console.error(err);
        } finally {
            setLoading(false);
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

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button className="btn-primary" onClick={fetchWatchHistory}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="history-page-container">
            <div className="history-header-premium">
                <h1 className="gradient-text">Watch History</h1>
                {videos.length > 0 && (
                    <div className="history-meta-animated">
                        <span className="count-badge">{videos.length}</span>
                        <span className="count-text">videos watched</span>
                    </div>
                )}
            </div>

            {videos.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📺</div>
                    <h3>No watch history yet</h3>
                    <p>Videos you watch will appear here</p>
                    <button className="btn-primary" onClick={() => navigate('/videos')}>
                        Start Watching
                    </button>
                </div>
            ) : (
                <div className="history-list">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} type="list" />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchHistory;
