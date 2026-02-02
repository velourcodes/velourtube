import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="app-sidebar">
            <nav className="sidebar-nav">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/history" className="nav-link">History</Link>
                <Link to="/liked-videos" className="nav-link">Liked Videos</Link>
                <Link to="/subscriptions" className="nav-link">Subscriptions</Link>
                <Link to="/my-playlists" className="nav-link">My Playlists</Link>
                <div style={{ margin: '1rem 0', borderTop: '1px solid #e5e5e5' }}></div>
                <Link to="/my-videos" className="nav-link">My Videos</Link>
            </nav>
        </aside>
    );
};

export default Sidebar;
