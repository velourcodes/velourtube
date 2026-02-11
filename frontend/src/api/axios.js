import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
console.log("Axios BaseURL configured as:", baseURL);

const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // specific check for 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const response = await axios.post('/api/v1/users/refresh-token', { refreshToken });
                    if (response.data.success || response.status === 200) {
                        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                        localStorage.setItem('accessToken', accessToken);
                        localStorage.setItem('refreshToken', newRefreshToken);

                        // update auth header
                        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed", refreshError);
                    // Clear tokens and maybe redirect to login (handled by auth context or router usually)
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    // Optional: window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
