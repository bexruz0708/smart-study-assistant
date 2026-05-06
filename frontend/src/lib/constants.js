export const APP_NAME = 'Smart Study Assistant';
export const APP_DESCRIPTION = 'AI yordamida o\'rganish platformasi';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DOCUMENTS: '/documents',
  DOCUMENT_DETAIL: '/documents/:id',
  CHAT: '/chat',
  CHAT_SESSION: '/chat/:id',
  PROJECT_INFO: '/project-info',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sa_access_token',
  REFRESH_TOKEN: 'sa_refresh_token',
  USER: 'sa_user',
  THEME: 'sa_theme',
};