import api from './axios';

// Health Check
export const healthCheck = () => {
    return api.get('/healthcheck');
};
