import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSubscribedChannels } from '../api/subscription.api';
import Loader from '../components/common/Loader';
import './Subscriptions.css';

const Subscriptions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?._id) {
            fetchSubscriptions();
        }
    }, [user]);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await getSubscribedChannels(user._id);
            if (response.data?.data?.userSubscriptions) {
                setSubscriptions(response.data.data.userSubscriptions);
            }
            setError('');
        } catch (err) {
            if (err.response?.status === 404) {
                setSubscriptions([]);
            } else {
                setError('Failed to load subscriptions');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="subscriptions-page-container">
            <div className="subs-header">
                <h1>Subscriptions</h1>
                {subscriptions.length > 0 && (
                    <div className="subs-meta-animated">
                        <span className="count-badge">{subscriptions.length}</span>
                        <span className="count-text">channels followed</span>
                    </div>
                )}
            </div>

            <div className="subs-content">
                {subscriptions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔔</div>
                        <h3>No subscriptions yet</h3>
                        <p>Stay updated with your favorite creators!</p>
                        <button className="btn-primary" onClick={() => navigate('/videos')}>
                            Explore Home
                        </button>
                    </div>
                ) : (
                    <div className="subs-grid">
                        {subscriptions.map((sub) => (
                            <div key={sub._id} className="channel-card" onClick={() => navigate(`/channel/${sub.channelUsername}`)}>
                                <div className="channel-avatar-wrapper">
                                    {sub.channelAvatarURL ? (
                                        <img src={sub.channelAvatarURL} alt={sub.channelUsername} />
                                    ) : (
                                        <div className="avatar-placeholder">👤</div>
                                    )}
                                </div>
                                <div className="channel-info">
                                    <h3 className="channel-name">@{sub.channelUsername}</h3>
                                    <button
                                        className="btn-secondary-small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/channel/${sub.channelUsername}`);
                                        }}
                                    >
                                        View Channel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subscriptions;
