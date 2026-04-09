const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const API_URL = 'http://localhost:9090/api';

export const authService = {

    login: async (username, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Invalid credentials');
            }

            const data = await response.json();
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data));

            return data;
        } catch (error) {
            throw new Error(error.message || 'Login failed. Please try again.');
        }
    },

    logout: (isWindowClosing = false) => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) return true;

            const logoutEndpoint = `${API_URL}/auth/logout`;

            if (isWindowClosing) {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', logoutEndpoint, false);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send();
            } else {
                fetch(logoutEndpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            return true;
        }
    },

    hasRole: (user, role) => {
        return user?.roles?.includes(role) || false;
    },

    isAdmin: (user) => {
        return authService.hasRole(user, 'ROLE_ADMIN');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    }
};