import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FiHome, FiClock, FiHeart, FiUsers, FiFolder,
    FiVideo, FiCompass, FiBell, FiTrendingUp
} from 'react-icons/fi';

const Sidebar = ({ context }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <aside className="app-sidebar">
            <nav className="sidebar-nav">
                {context === 'vox' ? (
                    <>
                        <Link to="/tweets" className={`nav-link ${isActive('/tweets') ? 'active' : ''}`}>
                            <FiHome className="nav-icon" /> Home Feed
                        </Link>
                        <Link to="/explore" className={`nav-link ${isActive('/explore') ? 'active' : ''}`}>
                            <FiCompass className="nav-icon" /> Explore
                        </Link>
                        <Link to="/notifications" className={`nav-link ${isActive('/notifications') ? 'active' : ''}`}>
                            <FiBell className="nav-icon" /> Notifications
                        </Link>
                        <Link to="/trending" className={`nav-link ${isActive('/trending') ? 'active' : ''}`}>
                            <FiTrendingUp className="nav-icon" /> Trending
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/videos" className={`nav-link ${isActive('/videos') ? 'active' : ''}`}>
                            <FiHome className="nav-icon" /> Home
                        </Link>
                        <Link to="/history" className={`nav-link ${isActive('/history') ? 'active' : ''}`}>
                            <FiClock className="nav-icon" /> History
                        </Link>
                        <Link to="/liked-videos" className={`nav-link ${isActive('/liked-videos') ? 'active' : ''}`}>
                            <FiHeart className="nav-icon" /> Liked Videos
                        </Link>
                        <Link to="/subscriptions" className={`nav-link ${isActive('/subscriptions') ? 'active' : ''}`}>
                            <FiUsers className="nav-icon" /> Subscriptions
                        </Link>
                        <Link to="/my-playlists" className={`nav-link ${isActive('/my-playlists') ? 'active' : ''}`}>
                            <FiFolder className="nav-icon" /> My Playlists
                        </Link>
                        <div className="sidebar-divider"></div>
                        <Link to="/my-videos" className={`nav-link ${isActive('/my-videos') ? 'active' : ''}`}>
                            <FiVideo className="nav-icon" /> My Videos
                        </Link>
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
