import apiClient from './apiClient';

export const personService = {
    getAll: async () => {
        const response = await apiClient.get('/person');
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/person/${id}`);
        return response.data;
    },

    register: async (dto) => {
        const response = await apiClient.post('/person/register', dto);
        return response.data;
    },

    update: async (id, dto) => {
        await apiClient.put(`/person/${id}`, dto);
    },

    delete: async (id) => {
        await apiClient.delete(`/person/${id}`);
    },
};
