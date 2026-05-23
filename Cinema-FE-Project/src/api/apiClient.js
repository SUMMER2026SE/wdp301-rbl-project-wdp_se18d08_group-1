import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

const baseURL = getApiBaseUrl();

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized (logout user, etc.)
            console.error('Unauthorized access');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
