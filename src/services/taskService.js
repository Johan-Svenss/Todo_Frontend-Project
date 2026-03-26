import apiClient from './apiClient';

export const taskService = {
    getAll: async () => {
        const response = await apiClient.get('/todo');
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/todo/${id}`);
        return response.data;
    },

    getByPerson: async (personId) => {
        const response = await apiClient.get(`/todo/person/${personId}`);
        return response.data;
    },

    getByStatus: async (completed) => {
        const response = await apiClient.get('/todo/status', { params: { completed } });
        return response.data;
    },

    getOverdue: async () => {
        const response = await apiClient.get('/todo/overdue');
        return response.data;
    },

    create: async (todoDto, files = []) => {
        const formData = new FormData();
        formData.append('todo', new Blob([JSON.stringify(todoDto)], { type: 'application/json' }));
        files.forEach(file => formData.append('files', file));
        const response = await apiClient.post('/todo', formData);
        return response.data;
    },

    update: async (id, todoDto, files = []) => {
        const formData = new FormData();
        formData.append('todo', new Blob([JSON.stringify(todoDto)], { type: 'application/json' }));
        files.forEach(file => formData.append('files', file));
        const response = await apiClient.put(`/todo/${id}`, formData);
        return response.data;
    },

    delete: async (id) => {
        await apiClient.delete(`/todo/${id}`);
    },
};
