import api from './axios';

// Add Comment
export const addComment = (data) => {
    return api.post('/comment/add-comment', data);
};

// Get Video Comments
export const getVideoComments = (videoId, params) => {
    return api.get(`/comment/get-video-comments/${videoId}`, { params });
};

// Update Comment
export const updateComment = (commentId, data) => {
    return api.patch(`/comment/update-comment/${commentId}`, data);
};

// Delete Comment
export const deleteComment = (commentId) => {
    return api.delete(`/comment/delete-comment/${commentId}`);
};
