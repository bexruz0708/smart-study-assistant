import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import router from './routes';
import useUIStore from '@/store/uiStore';

function App() {
  const { theme } = useUIStore();
  
  // Theme'ni dastlab qo'llash
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme={theme}
      />
    </>
  );
}

export default App;