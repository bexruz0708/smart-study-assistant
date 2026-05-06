import api from './axios';

export const quizzesAPI = {
  list: async () => {
    const response = await api.get('/quizzes/');
    return response.data;
  },
  
  get: async (id) => {
    const response = await api.get(`/quizzes/${id}/`);
    return response.data;
  },
  
  generate: async (documentId, count = 10, title = '') => {
    const response = await api.post('/quizzes/generate/', {
      document: documentId,
      count,
      title,
    });
    return response.data;
  },
  
  submit: async (id, answers) => {
    const response = await api.post(`/quizzes/${id}/submit/`, { answers });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/quizzes/${id}/`);
    return response.data;
  },
  
  attempts: async () => {
    const response = await api.get('/quizzes/attempts/');
    return response.data;
  },
  
  // ⭐ YANGI - PDF yuklab olish
  downloadAttemptPDF: async (attemptId) => {
    const response = await api.get(`/quizzes/attempts/${attemptId}/pdf/`, {
      responseType: 'blob',
    });
    
    // Brauzer'da yuklab olishga majbur qilish
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `test-natija-${attemptId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};