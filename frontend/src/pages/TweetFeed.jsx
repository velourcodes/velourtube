import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './TweetFeed.css';

const TweetFeed = () => {
    const { user } = useAuth();
    const [tweetText, setTweetText] = useState('');

    const handleTweetSubmit = (e) => {
        e.preventDefault();
        // Handle tweet submission
        console.log('Tweet:', tweetText);
        setTweetText('');
    };

    return (
        <div className="feed-container">
            <div className="feed-header">
                <h1>Tweet Feed</h1>
                <p>Share your thoughts with the community</p>
            </div>

            <div className="tweet-composer">
                <div className="composer-avatar">👤</div>
                <form onSubmit={handleTweetSubmit} className="composer-form">
                    <textarea
                        className="tweet-input"
                        placeholder="What's on your mind?"
                        value={tweetText}
                        onChange={(e) => setTweetText(e.target.value)}
                        maxLength={280}
                    />
                    <div className="composer-actions">
                        <span className="char-count">{tweetText.length}/280</span>
                        <button type="submit" className="btn-primary" disabled={!tweetText.trim()}>
                            Tweet
                        </button>
                    </div>
                </form>
            </div>

            <div className="tweets-list">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="tweet-card">
                        <div className="tweet-avatar">👤</div>
                        <div className="tweet-content">
                            <div className="tweet-header">
                                <span className="tweet-author">User Name</span>
                                <span className="tweet-username">@username</span>
                                <span className="tweet-time">• 2h ago</span>
                            </div>
                            <p className="tweet-text">
                                This is a sample tweet. It can contain up to 280 characters of text.
                                Users can share their thoughts, ideas, and updates here.
                            </p>
                            <div className="tweet-actions">
                                <button className="tweet-action">💬 12</button>
                                <button className="tweet-action">❤️ 45</button>
                                <button className="tweet-action">🔄 8</button>
                                <button className="tweet-action">📤</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TweetFeed;
