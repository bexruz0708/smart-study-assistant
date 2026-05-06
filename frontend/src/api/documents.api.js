import api from './axios';

export const documentsAPI = {
  /**
   * Hujjatlar ro'yxati
   */
  list: async () => {
    const response = await api.get('/documents/');
    return response.data;
  },

  /**
   * Bitta hujjat
   */
  get: async (id) => {
    const response = await api.get(`/documents/${id}/`);
    return response.data;
  },

  /**
   * Fayl yuklash
   */
  upload: async (file, title, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    const response = await api.post('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  /**
   * O'chirish
   */
  delete: async (id) => {
    const response = await api.delete(`/documents/${id}/`);
    return response.data;
  },

  /**
   * Qayta parse
   */
  reprocess: async (id) => {
    const response = await api.post(`/documents/${id}/reprocess/`);
    return response.data;
  },
};