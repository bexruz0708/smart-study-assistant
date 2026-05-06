import api from './axios';

export const flashcardsAPI = {
  list: async () => {
    const response = await api.get('/flashcards/');
    return response.data;
  },
  
  get: async (id) => {
    const response = await api.get(`/flashcards/${id}/`);
    return response.data;
  },
  
  generate: async (documentId, count = 15, title = '') => {
    const response = await api.post('/flashcards/generate/', {
      document: documentId,
      count,
      title,
    });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/flashcards/${id}/`);
    return response.data;
  },
  
  reviewCard: async (cardId, isCorrect) => {
    const response = await api.post(`/flashcards/cards/${cardId}/review/`, {
      is_correct: isCorrect,
    });
    return response.data;
  },
};