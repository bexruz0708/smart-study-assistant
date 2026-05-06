import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowRight, AlertCircle, Check } from 'lucide-react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import useAuthStore from '@/store/authStore';

// Validation schema
const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'Ism kerak')
    .min(2, 'Ism kamida 2 ta harf'),
  last_name: z
    .string()
    .min(1, 'Familiya kerak')
    .min(2, 'Familiya kamida 2 ta harf'),
  email: z
    .string()
    .min(1, 'Email kerak')
    .email('Email noto\'g\'ri formatda'),
  password: z
    .string()
    .min(8, 'Parol kamida 8 ta belgi')
    .regex(/[A-Z]/, 'Parolda kamida 1 ta katta harf bo\'lishi kerak')
    .regex(/[a-z]/, 'Parolda kamida 1 ta kichik harf bo\'lishi kerak')
    .regex(/[0-9]/, 'Parolda kamida 1 ta raqam bo\'lishi kerak'),
  password_confirm: z.string().min(1, 'Parolni tasdiqlang'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Parollar mos kelmadi',
  path: ['password_confirm'],
});

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });
  
  const password = watch('password', '');
  
  // Parol kuchini tekshirish (vizual)
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    
    const result = await registerUser(data);
    
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Ro\'yxatdan o\'tdingiz!', {
        description: 'Xush kelibsiz Smart Study Assistant\'ga!',
      });
      navigate('/dashboard');
    } else {
      const errors = result.error;
      let errorMsg = 'Ro\'yxatdan o\'tish xatosi';
      
      if (errors?.email) {
        errorMsg = errors.email[0];
      } else if (errors?.password) {
        errorMsg = errors.password[0];
      } else if (errors?.password_confirm) {
        errorMsg = errors.password_confirm[0];
      } else if (errors?.detail) {
        errorMsg = errors.detail;
      }
      
      setServerError(errorMsg);
      toast.error('Xato', { description: errorMsg });
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold">Ro'yxatdan o'tish</h2>
        <p className="text-muted-foreground mt-2">
          Yangi hisob yarating va o'rganishni boshlang
        </p>
      </div>
      
      {serverError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Ism va Familiya */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="first_name" required>Ism</Label>
            <Input
              id="first_name"
              icon={User}
              placeholder="Bexruz"
              error={!!errors.first_name}
              {...register('first_name')}
            />
            {errors.first_name && (
              <p className="text-xs text-destructive mt-1">{errors.first_name.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="last_name" required>Familiya</Label>
            <Input
              id="last_name"
              icon={User}
              placeholder="Shakarov"
              error={!!errors.last_name}
              {...register('last_name')}
            />
            {errors.last_name && (
              <p className="text-xs text-destructive mt-1">{errors.last_name.message}</p>
            )}
          </div>
        </div>
        
        {/* Email */}
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
        
        {/* Parol */}
        <div>
          <Label htmlFor="password" required>Parol</Label>
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
          
          {/* Parol kuchi indikatori */}
          {password && (
            <div className="mt-2 space-y-1">
              {[
                { check: passwordChecks.length, text: 'Kamida 8 ta belgi' },
                { check: passwordChecks.uppercase, text: 'Katta harf' },
                { check: passwordChecks.lowercase, text: 'Kichik harf' },
                { check: passwordChecks.number, text: 'Raqam' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 text-xs ${
                    item.check ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  <Check className={`w-3 h-3 ${item.check ? '' : 'opacity-30'}`} />
                  {item.text}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Parol tasdiqi */}
        <div>
          <Label htmlFor="password_confirm" required>Parolni tasdiqlang</Label>
          <Input
            id="password_confirm"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            error={!!errors.password_confirm}
            {...register('password_confirm')}
          />
          {errors.password_confirm && (
            <p className="text-xs text-destructive mt-1">{errors.password_confirm.message}</p>
          )}
        </div>
        
        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Ro'yxatdan o'tish
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
        Hisobingiz bormi?{' '}
        <Link
          to="/login"
          className="text-primary font-medium hover:underline"
        >
          Kirish
        </Link>
      </p>
    </div>
  );
};

export default Register;