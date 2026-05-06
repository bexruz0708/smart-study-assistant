import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Mail,
  User,
  Lock,
  Save,
  Calendar,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { authAPI } from '@/api/auth.api';
import useAuthStore from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import { formatDate } from '@/lib/utils';

const profileSchema = z.object({
  first_name: z.string().min(1, 'Ism kerak').min(2, 'Kamida 2 ta harf'),
  last_name: z.string().min(1, 'Familiya kerak').min(2, 'Kamida 2 ta harf'),
});

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Eski parol kerak'),
  new_password: z
    .string()
    .min(8, 'Kamida 8 ta belgi')
    .regex(/[A-Z]/, 'Katta harf bo\'lishi kerak')
    .regex(/[a-z]/, 'Kichik harf bo\'lishi kerak')
    .regex(/[0-9]/, 'Raqam bo\'lishi kerak'),
  new_password_confirm: z.string().min(1, 'Tasdiqlang'),
}).refine((data) => data.new_password === data.new_password_confirm, {
  message: 'Parollar mos kelmadi',
  path: ['new_password_confirm'],
});

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    },
  });
  
  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });
  
  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
    try {
      const updated = await authAPI.updateProfile(data);
      updateUser(updated);
      toast.success('Profil yangilandi!');
    } catch (error) {
      toast.error('Xato', {
        description: error.response?.data?.detail || 'Profil yangilanmadi',
      });
    } finally {
      setProfileLoading(false);
    }
  };
  
  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    try {
      await authAPI.changePassword(data);
      toast.success('Parol o\'zgartirildi!');
      passwordForm.reset();
    } catch (error) {
      const err = error.response?.data;
      const msg = err?.old_password?.[0]
        || err?.new_password?.[0]
        || err?.detail
        || 'Parol o\'zgartirilmadi';
      toast.error('Xato', { description: msg });
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase()
    : 'U';
  
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Profil</h1>
        <p className="text-muted-foreground mt-1">
          Hisobingiz ma'lumotlari va sozlamalari
        </p>
      </div>
      
      {/* User Card */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              {initials}
            </div>
            <button className="absolute -bottom-1 -right-1 p-1.5 bg-card border rounded-full hover:bg-muted">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">
              {user?.first_name} {user?.last_name}
            </h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs">
              {user?.is_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Tasdiqlangan
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(user?.date_joined)} dan beri
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'profile', label: 'Profil ma\'lumotlari' },
          { id: 'password', label: 'Parolni o\'zgartirish' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" required>Ism</Label>
              <Input
                id="first_name"
                icon={User}
                error={!!profileForm.formState.errors.first_name}
                {...profileForm.register('first_name')}
              />
              {profileForm.formState.errors.first_name && (
                <p className="text-xs text-destructive mt-1">
                  {profileForm.formState.errors.first_name.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="last_name" required>Familiya</Label>
              <Input
                id="last_name"
                icon={User}
                error={!!profileForm.formState.errors.last_name}
                {...profileForm.register('last_name')}
              />
              {profileForm.formState.errors.last_name && (
                <p className="text-xs text-destructive mt-1">
                  {profileForm.formState.errors.last_name.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              icon={Mail}
              value={user?.email || ''}
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email o'zgartirib bo'lmaydi
            </p>
          </div>
          
          <Button type="submit" loading={profileLoading}>
            <Save className="w-4 h-4" />
            Saqlash
          </Button>
        </form>
      )}
      
      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="old_password" required>Eski parol</Label>
            <Input
              id="old_password"
              type="password"
              icon={Lock}
              error={!!passwordForm.formState.errors.old_password}
              {...passwordForm.register('old_password')}
            />
            {passwordForm.formState.errors.old_password && (
              <p className="text-xs text-destructive mt-1">
                {passwordForm.formState.errors.old_password.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="new_password" required>Yangi parol</Label>
            <Input
              id="new_password"
              type="password"
              icon={Lock}
              error={!!passwordForm.formState.errors.new_password}
              {...passwordForm.register('new_password')}
            />
            {passwordForm.formState.errors.new_password && (
              <p className="text-xs text-destructive mt-1">
                {passwordForm.formState.errors.new_password.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="new_password_confirm" required>Yangi parolni tasdiqlang</Label>
            <Input
              id="new_password_confirm"
              type="password"
              icon={Lock}
              error={!!passwordForm.formState.errors.new_password_confirm}
              {...passwordForm.register('new_password_confirm')}
            />
            {passwordForm.formState.errors.new_password_confirm && (
              <p className="text-xs text-destructive mt-1">
                {passwordForm.formState.errors.new_password_confirm.message}
              </p>
            )}
          </div>
          
          <Button type="submit" loading={passwordLoading}>
            <Lock className="w-4 h-4" />
            Parolni o'zgartirish
          </Button>
        </form>
      )}
    </div>
  );
};

export default Profile;