import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Loader = ({ size = 'md', className, fullScreen = false }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <Loader2 className={cn('animate-spin text-primary', sizes.lg)} />
      </div>
    );
  }
  
  return (
    <Loader2 className={cn('animate-spin text-primary', sizes[size], className)} />
  );
};

export default Loader;