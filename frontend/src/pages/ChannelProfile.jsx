import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserChannelProfile } from '../api/user.api';
import { getAllVideos } from '../api/video.api';
import { toggleSubscription } from '../api/subscription.api';
import { getUserPlaylists } from '../api/playlist.api';
import VideoCard from '../components/common/VideoCard';
import Loader from '../components/common/Loader';
import './ChannelProfile.css';

const ChannelProfile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videosLoading, setVideosLoading] = useState(true);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('videos');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribersCount, setSubscribersCount] = useState(0);

    const isOwner = currentUser?.username === username;

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setVideos([]); // Reset videos to prevent stale data from previous profile
            const profileRes = await getUserChannelProfile(username);
            if (profileRes.data?.data) {
                const data = profileRes.data.data;
                setProfile(data);
                setIsSubscribed(data.isSubscribed);
                setSubscribersCount(data.subscibersCount || 0);

                // Now fetch videos for this user
                fetchChannelVideos(data._id);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            // navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchChannelVideos = async (userId) => {
        try {
            setVideosLoading(true);
            const videosRes = await getAllVideos({ userId, limit: 20 });
            if (videosRes.data?.data?.videos) {
                setVideos(videosRes.data.data.videos);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setVideos([]);
            }
            console.error("Error fetching channel videos:", err);
        } finally {
            setVideosLoading(false);
        }
    };

    const fetchChannelPlaylists = async (userId) => {
        if (!isOwner) return; // Only show playlists for owner's own channel

        try {
            setPlaylistsLoading(true);
            const response = await getUserPlaylists(userId);
            if (response.data?.data?.playlists) {
                setPlaylists(response.data.data.playlists);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setPlaylists([]);
            }
            console.error("Error fetching playlists:", err);
        } finally {
            setPlaylistsLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'playlists' && playlists.length === 0 && isOwner) {
            fetchChannelPlaylists(profile._id);
        }
    };

    const handleToggleSubscribe = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        if (isOwner) return;

        try {
            const res = await toggleSubscription(profile._id);
            if (res.status === 200) {
                const newStatus = !isSubscribed;
                setIsSubscribed(newStatus);
                setSubscribersCount(prev => newStatus ? prev + 1 : prev - 1);
            }
        } catch (err) {
            console.error("Error toggling subscription:", err);
        }
    };

    if (loading) return <Loader />;
    if (!profile) return <div className="error-state">Channel not found</div>;

    const bannerStyle = {
        backgroundImage: `url(${profile.coverImage?.secure_url || '/default-banner.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };

    return (
        <div className="channel-profile-container">
            <div className="channel-banner" style={bannerStyle}></div>

            <div className="channel-header-info">
                <div className="channel-id-section">
                    <div className="channel-avatar-large">
                        {profile.avatar?.secure_url ? (
                            <img src={profile.avatar.secure_url} alt={profile.username} />
                        ) : (
                            <div className="avatar-placeholder-large">👤</div>
                        )}
                    </div>
                    <div className="channel-text-details">
                        <h1 className="channel-display-name">{profile.fullName}</h1>
                        <p className="channel-handle-stats">
                            @{profile.username} • {subscribersCount} subscribers • {profile.channelsSubscribedTo || 0} subscribed
                        </p>
                        <div className="channel-actions">
                            {!isOwner && (
                                <button
                                    className={`btn-subscribe-large ${isSubscribed ? 'subscribed' : ''}`}
                                    onClick={handleToggleSubscribe}
                                >
                                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                </button>
                            )}
                            {isOwner && (
                                <button
                                    className="btn-secondary"
                                    onClick={() => navigate('/settings')}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="channel-tabs-container">
                <div className="channel-tabs">
                    <button
                        className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
                        onClick={() => handleTabChange('videos')}
                    >
                        Videos
                    </button>
                    {isOwner && (
                        <button
                            className={`tab ${activeTab === 'playlists' ? 'active' : ''}`}
                            onClick={() => handleTabChange('playlists')}
                        >
                            Playlists
                        </button>
                    )}
                </div>

                <div className="tab-content">
                    {activeTab === 'videos' && (
                        videosLoading ? (
                            <div className="videos-loader">Loading content...</div>
                        ) : videos.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🎬</div>
                                <h3>No videos uploaded yet</h3>
                                {isOwner && (
                                    <>
                                        <p>Start sharing your content with the world!</p>
                                        <button className="btn-primary" onClick={() => navigate('/upload')}>
                                            Upload Video
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="channel-videos-grid">
                                {videos.map(video => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        )
                    )}

                    {activeTab === 'playlists' && (
                        playlistsLoading ? (
                            <div className="videos-loader">Loading playlists...</div>
                        ) : playlists.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📚</div>
                                <h3>No playlists created yet</h3>
                                <p>Organize your videos into playlists</p>
                                <button className="btn-primary" onClick={() => navigate('/my-playlists')}>
                                    Create Playlist
                                </button>
                            </div>
                        ) : (
                            <div className="playlists-grid">
                                {playlists.map(playlist => (
                                    <div key={playlist._id} className="playlist-card" onClick={() => navigate(`/playlist/${playlist._id}`)}>
                                        <div className="playlist-thumbnail">
                                            <div className="playlist-count">{playlist.playlistVideoCount} videos</div>
                                        </div>
                                        <div className="playlist-info">
                                            <h3>{playlist.name}</h3>
                                            <p>{playlist.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChannelProfile;
