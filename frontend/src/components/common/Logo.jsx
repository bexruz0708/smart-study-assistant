import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Logo = ({ size = 'md', showText = true, className }) => {
  const sizes = {
    sm: { icon: 'w-5 h-5', text: 'text-base', wrapper: 'p-1.5' },
    md: { icon: 'w-6 h-6', text: 'text-xl', wrapper: 'p-2' },
    lg: { icon: 'w-8 h-8', text: 'text-2xl', wrapper: 'p-2.5' },
  };
  
  const s = sizes[size];
  
  return (
    <Link to="/" className={cn('flex items-center gap-2.5 group', className)}>
      <div className={cn(
        'bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg group-hover:scale-105 transition-transform',
        s.wrapper
      )}>
        <Sparkles className={cn('text-white', s.icon)} />
      </div>
      {showText && (
        <span className={cn('font-bold text-foreground', s.text)}>
          Smart Study
        </span>
      )}
    </Link>
  );
};

export default Logo;