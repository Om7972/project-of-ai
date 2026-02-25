import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('cardioai_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // In a real app, you might fetch user profile here
            // For now, we decode token or use stored user info
            const savedUser = localStorage.getItem('cardioai_user');
            if (savedUser) setUser(JSON.parse(savedUser));
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            // API expects form-data for OAuth2PasswordRequestForm
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await axios.post('http://localhost:8000/api/v1/auth/login', formData);
            const { access_token } = response.data;

            setToken(access_token);
            localStorage.setItem('cardioai_token', access_token);

            // Mock user info from email
            const userInfo = { email, name: email.split('@')[0], role: 'doctor' };
            setUser(userInfo);
            localStorage.setItem('cardioai_user', JSON.stringify(userInfo));

            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            await axios.post('http://localhost:8000/api/v1/auth/register', {
                name,
                email,
                password
            });
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
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
