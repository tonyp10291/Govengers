import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decodedToken = jwtDecode(storedToken);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setToken(storedToken);
                    setUserRole(decodedToken.role);
                    setUserId(decodedToken.sub);
                    setIsLoggedIn(true);
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
            }
        }
    }, []);

    const login = (newToken) => {
        try {
            const decodedToken = jwtDecode(newToken);
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUserRole(decodedToken.role);
            setUserId(decodedToken.sub);
            setIsLoggedIn(true);
        } catch (error) {
            console.error("Failed to decode token on login:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUserRole(null);
        setIsLoggedIn(false);
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, userRole, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;