
let logoutCallback = null;
let shouldLogout = false;

export const initializeWindowEvents = (callback) => {
    logoutCallback = callback;

    const handleBeforeUnload = (event) => {
        if (logoutCallback) {
            event.preventDefault();
            event.returnValue = '';
            shouldLogout = true;
            return event.returnValue;
        }
    };

    const handleUnload = () => {
        if (shouldLogout) {
            const token = localStorage.getItem('auth_token');

            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');

            if (token) {
                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', 'http://localhost:9090/api/auth/logout', false);
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.send();
                } catch (error) {
                    console.error('Logout error during window closing:', error);
                }
            }
        }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('unload', handleUnload);
        logoutCallback = null;
        shouldLogout = false;
    };
};

export const removeWindowEvents = () => {
    logoutCallback = null;
    shouldLogout = false;
};