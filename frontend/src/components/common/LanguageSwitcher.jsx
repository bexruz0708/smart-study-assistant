import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];
  
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors"
        title="Language"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden md:inline text-sm font-medium">{currentLang.flag}</span>
        <ChevronDown className={cn(
          'w-3 h-3 transition-transform hidden md:block',
          open && 'rotate-180'
        )} />
      </button>
      
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 bg-card border rounded-lg shadow-lg z-50 py-1 animate-fade-in">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2',
                  currentLang.code === lang.code && 'bg-muted font-medium'
                )}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="flex-1">{lang.name}</span>
                {currentLang.code === lang.code && (
                  <span className="text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;