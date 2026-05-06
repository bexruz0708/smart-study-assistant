import { createBrowserRouter, Navigate } from 'react-router-dom';

import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import PublicRoute from '@/routes/PublicRoute';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Documents from '@/pages/Documents';
import Chat from '@/pages/Chat';
import ProjectInfo from '@/pages/ProjectInfo';
import Profile from '@/pages/Profile';
import Quizzes from '@/pages/Quizzes';
import QuizDetail from '@/pages/QuizDetail';
import Flashcards from '@/pages/Flashcards';
import FlashcardStudy from '@/pages/FlashcardStudy';

const router = createBrowserRouter([
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/documents', element: <Documents /> },
      { path: '/chat', element: <Chat /> },
      { path: '/project-info', element: <ProjectInfo /> },
      { path: '/quizzes', element: <Quizzes /> },
      { path: '/quizzes/:id', element: <QuizDetail /> },
      { path: '/flashcards', element: <Flashcards /> },
      { path: '/flashcards/:id/study', element: <FlashcardStudy /> },
      { path: '/profile', element: <Profile /> },
    ],
  },
  
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export default router;