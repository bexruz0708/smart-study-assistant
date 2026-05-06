import api from './axios';

export const chatAPI = {
  /**
   * Sessiyalar ro'yxati
   */
  listSessions: async () => {
    const response = await api.get('/chat/sessions/');
    return response.data;
  },

  /**
   * Bitta sessiya (xabarlar bilan)
   */
  getSession: async (id) => {
    const response = await api.get(`/chat/sessions/${id}/`);
    return response.data;
  },

  /**
   * Yangi sessiya yaratish (PDF chat)
   */
  createSession: async (documentId, title = '') => {
    const response = await api.post('/chat/sessions/', {
      document: documentId,
      title,
      session_type: 'document',
    });
    return response.data;
  },

  /**
   * Sessiyani o'chirish
   */
  deleteSession: async (id) => {
    const response = await api.delete(`/chat/sessions/${id}/`);
    return response.data;
  },

  /**
   * PDF haqida savol berish
   */
  ask: async (sessionId, question) => {
    const response = await api.post(`/chat/sessions/${sessionId}/ask/`, {
      question,
    });
    return response.data;
  },

  /**
   * Loyiha haqida savol berish ⭐
   */
  askProjectInfo: async (question) => {
    const response = await api.post('/chat/project-info/ask/', {
      question,
    });
    return response.data;
  },
};