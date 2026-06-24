import { use } from "react";
import api from "../utils/api";

export const authService = {
    async register(userData) {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    },

    async login(credentials) {
        const response = await api.post('/api/auth/login', credentials);
        if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    },
};