import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllVideos } from '../api/video.api';
import SearchBar from '../components/common/SearchBar';
import { getRelativeTime } from '../utils/timeUtils';
import VideoCard from '../components/common/VideoCard';
import './HomeFeed.css';

const HomeFeed = () => {
    const { user } = useAuth();
    const [videos, setVideos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [query, setQuery] = React.useState('');
    const [error, setError] = React.useState(null);

    // Advanced Filters State
    const [sortBy, setSortBy] = React.useState('createdAt');
    const [sortType, setSortType] = React.useState('desc');
    const [limit, setLimit] = React.useState(10);
    const [inputPage, setInputPage] = React.useState(1);

    React.useEffect(() => {
        fetchVideos();
    }, [page, query, sortBy, sortType, limit]);

    React.useEffect(() => {
        setInputPage(page);
    }, [page]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await getAllVideos({
                page,
                limit,
                query,
                sortBy,
                sortType
            });

            // Backend returns: { data: { videos: [], pagination: {} }, statusCode, message, success }
            const apiResponse = response.data;
            const payload = apiResponse.data;

            if (payload && Array.isArray(payload.videos)) {
                setVideos(payload.videos);
                setTotalPages(payload.pagination?.totalPages || 1);
            } else {
                setVideos([]);
                setTotalPages(1);
            }

            setError(null);
        } catch (err) {
            console.error("Error fetching videos:", err);
            setError("Failed to load videos. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (newQuery) => {
        setQuery(newQuery);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo(0, 0);
        }
    };

    const handlePageInputSubmit = (e) => {
        e.preventDefault();
        const pageNum = parseInt(inputPage);
        if (pageNum >= 1 && pageNum <= totalPages) {
            setPage(pageNum);
            window.scrollTo(0, 0);
        } else {
            setInputPage(page);
        }
    };

    const handleLimitChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 1 && value <= 100) {
            setLimit(value);
            setPage(1); // Reset to page 1 when changing limit
        }
    };

    return (
        <div className="feed-container">
            <div className="feed-header">
                <h1>Velour Vortex</h1>
                <p>Immerse yourself in a world of curated content</p>
            </div>

            <div className="search-filter-container">
                <SearchBar onSearch={handleSearch} placeholder="Search Velour Vortex..." />

                <div className="filter-bar">
                    <div className="filter-group">
                        <label>Sort By:</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                            <option value="createdAt">Upload Date</option>
                            <option value="views">Views</option>
                            <option value="duration">Duration</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Order:</label>
                        <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="filter-select">
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Limit:</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={limit}
                            onChange={handleLimitChange}
                            className="filter-input"
                            placeholder="1-100"
                        />
                    </div>
                </div>
            </div>



            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div> Loading content...
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={fetchVideos} className="btn-secondary">Retry</button>
                </div>
            ) : (
                <>
                    <div className="feed-grid">
                        {videos.length > 0 ? (
                            videos.map((video) => (
                                <VideoCard key={video._id} video={video} />
                            ))
                        ) : (
                            <div className="no-results">
                                <p>No videos found{query ? ` matching "${query}"` : ""}</p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="pagination-btn"
                            >
                                Previous
                            </button>

                            <form onSubmit={handlePageInputSubmit} className="page-input-form">
                                <span className="page-label">Page</span>
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    value={inputPage}
                                    onChange={(e) => setInputPage(e.target.value)}
                                    className="page-input"
                                />
                                <span className="page-total">of {totalPages}</span>
                                <button type="submit" className="go-btn">Go</button>
                            </form>

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="pagination-btn"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HomeFeed;
