import api from './axios';

// Register User
export const registerUser = (data) => {
    return api.post('/users/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Login User
export const loginUser = (data) => {
    return api.post('/users/login', data);
};

// Logout User
export const logoutUser = () => {
    return api.post('/users/logout');
};

// Refresh Token
export const refreshAccessToken = (refreshToken) => {
    return api.post('/users/refresh-token', { refreshToken });
};

// Update Password
export const updatePassword = (data) => {
    return api.post('/users/update-password', data);
};

// Get Current User
export const getCurrentUser = () => {
    return api.get('/users/get-current-user');
};

// Update User Details
export const updateUserDetails = (data) => {
    return api.post('/users/update-user-details', data);
};

// Update Avatar
export const updateAvatar = (data) => {
    return api.patch('/users/update-avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Update Cover Image
export const updateCoverImage = (data) => {
    return api.patch('/users/update-cover-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Delete User
export const deleteUser = () => {
    return api.delete('/users/delete-user');
};

// Get User Channel Profile
export const getUserChannelProfile = (username) => {
    return api.get(`/users/c/${username}`);
};

// Get Watch History
export const getWatchHistory = () => {
    return api.get('/users/watch-history');
};
