import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRelativeTime, getDateFromId } from '../../utils/timeUtils';
import './VideoCard.css';

const VideoCard = ({ video, type = 'grid' }) => {
    const navigate = useNavigate();

    if (!video) return null;

    // Robust Mapping for inconsistent backend responses
    const title = video.title || 'Untitled Video';
    const thumbnail = (typeof video.thumbnail === 'string' ? video.thumbnail : video.thumbnail?.secure_url) || video.thumbnailURL || video.thumbnail?.url || '';
    const duration = video.duration || video.videoDuration || 0;
    const views = video.views || video.viewCount || 0;
    const date = video.createdAt || video.updatedAt || (video._id ? getDateFromId(video._id) : new Date());

    // Channel Mapping - handle multiple backend response formats
    const owner = Array.isArray(video.owner) ? video.owner[0] : video.owner;
    const channelName = video.videoOwnerUsername || video.ownerUsername || video.username || owner?.username || owner?.fullName || 'Unknown Channel';
    const channelAvatar = video.videoOwnerAvatarURL || video.ownerAvatarURL || video.avatarURL || owner?.avatarURL || owner?.avatar?.secure_url || '';
    const channelHandle = video.videoOwnerUsername || video.ownerUsername || video.username || owner?.username || '';

    const formatViews = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleClick = () => {
        navigate(`/video/${video._id}`);
    };

    if (type === 'list') {
        return (
            <div className="video-card-list" onClick={handleClick}>
                <div className="card-thumbnail-wrapper-list">
                    <img src={thumbnail} alt={title} className="card-thumbnail-list" />
                    <div className="card-duration-list">{formatDuration(duration)}</div>
                </div>
                <div className="card-info-list">
                    <h3 className="card-title-list">{title}</h3>
                    <div className="card-meta-list">
                        <span>{formatViews(views)} views • {getRelativeTime(date)}</span>
                    </div>
                    <div className="card-channel-list">
                        <div className="card-avatar-list" onClick={(e) => { e.stopPropagation(); navigate(`/channel/${channelHandle}`); }}>
                            {channelAvatar ? <img src={channelAvatar} alt={channelName} /> : <span>👤</span>}
                        </div>
                        <span className="card-channel-name-list" onClick={(e) => { e.stopPropagation(); navigate(`/channel/${channelHandle}`); }}>
                            {channelName}
                        </span>
                    </div>
                    {video.description && <p className="card-desc-list">{video.description}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="video-card-grid" onClick={handleClick}>
            <div className="card-thumbnail-wrapper">
                <img src={thumbnail} alt={title} className="card-thumbnail" />
                <div className="card-duration">{formatDuration(duration)}</div>
            </div>
            <div className="card-content">
                <div className="card-avatar" onClick={(e) => { e.stopPropagation(); navigate(`/channel/${channelHandle}`); }}>
                    {channelAvatar ? <img src={channelAvatar} alt={channelName} /> : <span>👤</span>}
                </div>
                <div className="card-details">
                    <h3 className="card-title">{title}</h3>
                    <p className="card-channel-name" onClick={(e) => { e.stopPropagation(); navigate(`/channel/${channelHandle}`); }}>
                        {channelName}
                    </p>
                    <p className="card-meta">
                        {formatViews(views)} views • {getRelativeTime(date)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
