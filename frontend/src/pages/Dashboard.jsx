import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Plus,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { documentsAPI } from '@/api/documents.api';
import { chatAPI } from '@/api/chat.api';
import useAuthStore from '@/store/authStore';
import Button from '@/components/ui/Button';
import Loader from '@/components/common/Loader';
import { formatDate, formatFileSize } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    documentsCount: 0,
    sessionsCount: 0,
    totalWords: 0,
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboard();
  }, []);
  
  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      const [documentsRes, sessionsRes] = await Promise.all([
        documentsAPI.list().catch(() => ({ results: [] })),
        chatAPI.listSessions().catch(() => ({ results: [] })),
      ]);
      
      const docs = documentsRes.results || documentsRes || [];
      const sessions = sessionsRes.results || sessionsRes || [];
      
      const totalWords = docs.reduce((sum, doc) => sum + (doc.word_count || 0), 0);
      
      setStats({
        documentsCount: docs.length,
        sessionsCount: sessions.length,
        totalWords,
      });
      
      setRecentDocs(docs.slice(0, 5));
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const statCards = [
    {
      title: 'Hujjatlar',
      value: stats.documentsCount,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
    },
    {
      title: 'AI Suhbatlar',
      value: stats.sessionsCount,
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600',
    },
    {
      title: 'O\'rganilgan so\'zlar',
      value: stats.totalWords.toLocaleString(),
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600',
    },
  ];
  
  const quickActions = [
    {
      title: 'Hujjat yuklash',
      description: 'Yangi PDF yoki Word fayl',
      icon: Upload,
      onClick: () => navigate('/documents'),
    },
    {
      title: 'AI bilan suhbat',
      description: 'Hujjatingiz haqida savol bering',
      icon: MessageSquare,
      onClick: () => navigate('/chat'),
    },
    {
      title: 'Loyiha haqida',
      description: 'Loyiha haqida AI ga savol bering',
      icon: Sparkles,
      onClick: () => navigate('/project-info'),
    },
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Salom, {user?.first_name || 'Foydalanuvchi'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Bugun nimalarni o'rganamiz?
          </p>
        </div>
        <Button onClick={() => navigate('/documents')}>
          <Plus className="w-4 h-4" />
          Yangi hujjat
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.title}</div>
            </div>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tezkor amallar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={action.onClick}
                className="bg-card border rounded-xl p-6 text-left hover:shadow-md hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold">{action.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Recent Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">So'nggi hujjatlar</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/documents')}
          >
            Hammasini ko'rish
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        
        {recentDocs.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Hujjat yo'q</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Birinchi hujjatingizni yuklang va AI bilan suhbatni boshlang
            </p>
            <Button onClick={() => navigate('/documents')}>
              <Upload className="w-4 h-4" />
              Hujjat yuklash
            </Button>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            {recentDocs.map((doc, i) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/documents/${doc.id}`)}
                className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-muted text-left transition-colors ${
                  i !== recentDocs.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{doc.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{doc.file_type?.toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>{formatDate(doc.created_at)}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;