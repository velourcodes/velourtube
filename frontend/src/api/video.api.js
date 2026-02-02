import api from './axios';

// Get All Videos
export const getAllVideos = ({ page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc', userId = '' }) => {
    return api.get('/video/get-all-videos', {
        params: {
            page,
            limit,
            query,
            sortBy,
            sortType,
            userId
        }
    });
};

// Publish Video
export const publishAVideo = (data) => {
    return api.post('/video/publish-video', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Get Video By ID
export const getVideoById = (videoId) => {
    return api.get(`/video/get-video-by-id/${videoId}`);
};

// Update Video By ID
export const updateVideoById = (videoId, data) => {
    return api.patch(`/video/update-video-by-id/${videoId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Delete Video
export const deleteVideo = (videoId) => {
    return api.delete(`/video/delete-video/${videoId}`);
};

// Toggle Publish Status
export const togglePublishStatus = (videoId) => {
    return api.patch(`/video/toggle-publish-status/${videoId}`);
};
