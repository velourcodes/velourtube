import React, { useState, useEffect } from 'react';
import { getLikedVideos } from '../api/like.api';
import VideoCard from '../components/common/VideoCard';
import Loader from '../components/common/Loader';
import './LikedVideos.css';

const LikedVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLikedVideos();
    }, []);

    const fetchLikedVideos = async () => {
        try {
            setLoading(true);
            const response = await getLikedVideos();
            if (response.data?.data) {
                // Handle both: [{ video: { ... } }] and [{ ...videoFields }]
                const likedVideosData = response.data.data
                    .map(item => item.video || item)
                    .filter(video => video !== null && (video.title || video._id));
                setVideos(likedVideosData);
            }
            setError('');
        } catch (err) {
            if (err.response?.status === 404) {
                setVideos([]);
            } else {
                setError('Failed to load liked videos');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="liked-videos-container">
            <div className="liked-page-header">
                <h1 className="gradient-text">Liked Videos</h1>
                <div className="liked-meta-animated">
                    <span className="count-badge">{videos.length}</span>
                    <span className="count-text">videos liked</span>
                </div>
            </div>

            <div className="liked-content">
                {videos.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">❤️</div>
                        <h3>No liked videos yet</h3>
                        <p>Videos you like will appear here</p>
                        <button className="btn-primary" onClick={() => navigate('/videos')}>
                            Discover Videos
                        </button>
                    </div>
                ) : (
                    <div className="liked-grid">
                        {videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LikedVideos;
