import React, { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
            // You could also verify the token with your backend here
            setIsAuthenticated(true);
        } else {
            // Redirect to login if no token
            window.location.href = '/login';
        }
        
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return isAuthenticated ? children : null;
};

export default ProtectedRoute;
