import api from './axios';

export const authAPI = {
  /**
   * Ro'yxatdan o'tish
   */
  register: async (data) => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  /**
   * Kirish
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  /**
   * Chiqish
   */
  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  /**
   * Token yangilash
   */
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  /**
   * Profil olish
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  /**
   * Profil yangilash
   */
  updateProfile: async (data) => {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  },

  /**
   * Parol o'zgartirish
   */
  changePassword: async (data) => {
    const response = await api.post('/auth/change-password/', data);
    return response.data;
  },
};