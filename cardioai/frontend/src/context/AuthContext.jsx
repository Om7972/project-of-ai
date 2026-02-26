import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('cardioai_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const response = await authApi.me();
                    setUser(response.data);
                    localStorage.setItem('cardioai_user', JSON.stringify(response.data));
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    if (error.response && error.response.status === 401) {
                        logout();
                    } else {
                        // Fallback to locally stored user if network issue or 404
                        const savedUser = localStorage.getItem('cardioai_user');
                        if (savedUser) setUser(JSON.parse(savedUser));
                    }
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await authApi.login(email, password);
            const { access_token, user: loggedInUser } = response.data;

            setToken(access_token);
            localStorage.setItem('cardioai_token', access_token);

            if (loggedInUser) {
                setUser(loggedInUser);
                localStorage.setItem('cardioai_user', JSON.stringify(loggedInUser));
            } else {
                // Fetch real user info right after
                try {
                    // Manually set token for this initial request as state update may be pending
                    const meResponse = await authApi.me();
                    setUser(meResponse.data);
                    localStorage.setItem('cardioai_user', JSON.stringify(meResponse.data));
                } catch (err) {
                    console.error('Could not fetch user profile details after login', err);
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            await authApi.register({ name, email, password });
            return { success: true };
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('cardioai_token');
        localStorage.removeItem('cardioai_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
