import { cn } from '@/lib/utils';

const Label = ({ children, className, required, ...props }) => {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-foreground mb-1.5',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
};

export default Label;