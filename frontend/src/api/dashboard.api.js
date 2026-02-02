import api from './axios';

// Get Channel Stats
export const getChannelStats = () => {
    return api.get('/dashboard/get-channel-stats');
};

// Get Channel Videos
export const getChannelVideos = () => {
    return api.get('/dashboard/get-channel-videos');
};
