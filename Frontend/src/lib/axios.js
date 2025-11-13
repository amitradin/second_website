import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/api',
    //baseURL: 'http://localhost:5001/api', // this is for testing purposes
});

// Add a request interceptor to include the auth token
instance.interceptors.request.use(
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
);//

let isRefreshing = false;
let failedQueue = [];

// Add a response interceptor to handle token expiration
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        const response = await axios.post(`${instance.defaults.baseURL}/users/refresh-token`, {
                            refreshToken
                        });
                        
                        const { accessToken } = response.data;
                        localStorage.setItem('accessToken', accessToken);
                        
                        instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        
                        failedQueue.forEach(prom => prom.resolve(accessToken));
                        failedQueue = [];
                        
                        return instance(originalRequest);
                    } catch (refreshError) {
                        failedQueue.forEach(prom => prom.reject(refreshError));
                        failedQueue = [];
                        // Refresh token is invalid, redirect to login
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login'; // You'll need to create this page
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                }
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve: () => resolve(instance(originalRequest)), reject });
                });
            }
        }
        
        return Promise.reject(error);
    }
);

export default instance;