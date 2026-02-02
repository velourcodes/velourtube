import api from './axios';

// Create Playlist
export const createPlaylist = (data) => {
    return api.post('/playlist/create-playlist', data);
};

// Get User Playlists
export const getUserPlaylists = (userId) => {
    return api.get(`/playlist/get-user-playlists/${userId}`);
};

// Get Playlist By ID
export const getPlaylistById = (playlistId) => {
    return api.get(`/playlist/get-playlist-by-id/${playlistId}`);
};

// Add Video To Playlist
export const addVideoToPlaylist = (playlistId, videoId) => {
    return api.patch(`/playlist/add-video-to-playlist/${playlistId}/${videoId}`);
};

// Remove Video From Playlist
export const removeVideoFromPlaylist = (playlistId, videoId) => {
    return api.patch(`/playlist/remove-video-from-playlist/${playlistId}/${videoId}`);
};

// Delete Playlist
export const deletePlaylist = (playlistId) => {
    return api.delete(`/playlist/delete-playlist/${playlistId}`);
};

// Update Playlist
export const updatePlaylist = (playlistId, data) => {
    return api.patch(`/playlist/update-playlist/${playlistId}`, data);
};
