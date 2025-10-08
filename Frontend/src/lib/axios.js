import axios from "axios";

const instance = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? "https://your-backend-service-name.onrender.com/api"  // Replace with your actual Render backend URL
        : "http://localhost:5001/api",
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
);

// Add a response interceptor to handle token expiration
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const baseURL = process.env.NODE_ENV === 'production' 
                        ? "https://your-backend-service-name.onrender.com/api"  // Replace with your actual Render backend URL
                        : "http://localhost:5001/api";
                    
                    const response = await axios.post(`${baseURL}/users/refresh-token`, {
                        refreshToken
                    });
                    
                    const { accessToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);
                    
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return instance(originalRequest);
                } catch (refreshError) {
                    // Refresh token is invalid, redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login'; // You'll need to create this page
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export default instance;