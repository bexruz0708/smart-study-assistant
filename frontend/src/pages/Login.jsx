import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import useAuthStore from '@/store/authStore';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email kerak')
    .email('Email noto\'g\'ri formatda'),
  password: z
    .string()
    .min(1, 'Parol kerak')
    .min(8, 'Parol kamida 8 ta belgi'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    
    const result = await login(data);
    
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Muvaffaqiyatli kirdingiz!', {
        description: `Xush kelibsiz, ${result.data.user.first_name || result.data.user.email}!`,
      });
      navigate('/dashboard');
    } else {
      const errorMsg = result.error?.detail 
        || result.error?.non_field_errors?.[0]
        || result.error?.email?.[0]
        || result.error?.password?.[0]
        || 'Email yoki parol noto\'g\'ri';
      
      setServerError(errorMsg);
      toast.error('Kirish xatosi', {
        description: errorMsg,
      });
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold">Xush kelibsiz!</h2>
        <p className="text-muted-foreground mt-2">
          Davom etish uchun hisobingizga kiring
        </p>
      </div>
      
      {serverError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input
            id="email"
            type="email"
            icon={Mail}
            placeholder="email@example.com"
            error={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" required>Parol</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Parolni unutdingizmi?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            error={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Kirish
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">yoki</span>
        </div>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        Hisobingiz yo'qmi?{' '}
        <Link
          to="/register"
          className="text-primary font-medium hover:underline"
        >
          Ro'yxatdan o'ting
        </Link>
      </p>
    </div>
  );
};

export default Login;