import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null); // 사용자 정보 전체 (role 등 포함)
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decodedToken = jwtDecode(storedToken);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setToken(storedToken);
                    setUser(decodedToken);
                    setUserRole(decodedToken.role);
                    setIsLoggedIn(true);
                } else {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setUserRole(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
                setUserRole(null);
                setIsLoggedIn(false);
            }
        } else {
            setToken(null);
            setUser(null);
            setUserRole(null);
            setIsLoggedIn(false);
        }
        setLoading(false);
    }, []);

    const login = (newToken) => {
        try {
            const decodedToken = jwtDecode(newToken);
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(decodedToken);
            setUserRole(decodedToken.role);
            setIsLoggedIn(true);
        } catch (error) {
            console.error("Failed to decode token on login:", error);
            setToken(null);
            setUser(null);
            setUserRole(null);
            setIsLoggedIn(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setUserRole(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            token,
            user,
            userRole,
            login,
            logout,
            loading,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
