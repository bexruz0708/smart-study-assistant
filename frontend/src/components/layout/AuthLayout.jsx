import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Top */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <Sparkles className="w-7 h-7" />
          </div>
          <span className="font-bold text-2xl">Smart Study</span>
        </div>
        
        {/* Middle */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold leading-tight">
            AI yordamida<br />
            <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              o'rganishni
            </span><br />
            tezlashtiring
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            PDF yuklang, AI bilan suhbatlashing, avtomatik testlar va flashkartalar yarating.
          </p>
          
          {/* Features */}
          <div className="space-y-3 pt-4">
            {[
              '✨ AI bilan suhbat (RAG texnologiyasi)',
              '📚 PDF/Word fayllarni avtomatik tahlil',
              '🎯 Avtomatik test va flashkartalar',
              '🚀 Bepul va o\'zbek tilida',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-white/90">
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom */}
        <div className="relative z-10 text-sm text-white/60">
          © 2026 Smart Study Assistant.
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;