import api from './axios';

// Toggle Video Like
export const toggleVideoLike = (videoId) => {
    return api.post(`/like/toggle-video-like/${videoId}`);
};

// Toggle Comment Like
export const toggleCommentLike = (commentId) => {
    return api.post(`/like/toggle-comment-like/${commentId}`);
};

// Toggle Tweet Like
export const toggleTweetLike = (tweetId) => {
    return api.post(`/like/toggle-tweet-like/${tweetId}`);
};

// Get Liked Videos
export const getLikedVideos = () => {
    return api.get('/like/get-liked-videos');
};
