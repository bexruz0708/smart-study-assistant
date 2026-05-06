import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Trash2,
  MessageSquare,
  Search,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { documentsAPI } from '@/api/documents.api';
import { chatAPI } from '@/api/chat.api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/common/Loader';
import { formatDate, formatFileSize } from '@/lib/utils';

const Documents = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  useEffect(() => {
    loadDocuments();
  }, []);
  
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsAPI.list();
      const docs = data.results || data || [];
      setDocuments(docs);
    } catch (error) {
      toast.error('Hujjatlarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileSelect = (file) => {
    if (!file) return;
    
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(ext)) {
      toast.error('Faqat PDF, DOCX va TXT qabul qilinadi');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fayl 10MB dan kichik bo\'lishi kerak');
      return;
    }
    
    uploadFile(file);
  };
  
  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      const title = file.name.split('.').slice(0, -1).join('.');
      
      const data = await documentsAPI.upload(file, title, (progress) => {
        setUploadProgress(progress);
      });
      
      toast.success('Fayl yuklandi va qayta ishlandi!', {
        description: data.document?.title,
      });
      
      await loadDocuments();
    } catch (error) {
      const errorMsg = error.response?.data?.error
        || error.response?.data?.detail
        || 'Yuklashda xato';
      toast.error('Xato', { description: errorMsg });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleDelete = async (id, title) => {
    if (!confirm(`"${title}" hujjatini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }
    
    try {
      await documentsAPI.delete(id);
      toast.success('Hujjat o\'chirildi');
      await loadDocuments();
    } catch (error) {
      toast.error('O\'chirishda xato');
    }
  };
  
  const handleStartChat = async (doc) => {
    try {
      const session = await chatAPI.createSession(doc.id, `Chat: ${doc.title}`);
      navigate(`/chat?session=${session.id}`);
    } catch (error) {
      toast.error('Suhbat yaratishda xato');
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };
  
  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );
  
  const getStatusBadge = (status) => {
    const statuses = {
      completed: { icon: CheckCircle2, color: 'text-green-600 bg-green-500/10', label: 'Tayyor' },
      processing: { icon: Clock, color: 'text-yellow-600 bg-yellow-500/10', label: 'Ishlanyapti' },
      pending: { icon: Clock, color: 'text-gray-600 bg-gray-500/10', label: 'Kutilyapti' },
      failed: { icon: XCircle, color: 'text-red-600 bg-red-500/10', label: 'Xato' },
    };
    
    const s = statuses[status] || statuses.pending;
    const Icon = s.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${s.color}`}>
        <Icon className="w-3 h-3" />
        {s.label}
      </span>
    );
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Hujjatlar</h1>
        <p className="text-muted-foreground mt-1">
          PDF/Word fayllaringizni yuklang va AI bilan suhbatlashing
        </p>
      </div>
      
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        
        {uploading ? (
          <div className="space-y-4">
            <Loader size="lg" className="mx-auto" />
            <div>
              <p className="font-medium">Yuklanmoqda... {uploadProgress}%</p>
              <div className="mt-2 max-w-sm mx-auto bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="inline-flex p-3 bg-primary/10 rounded-full mb-3">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Fayl yuklash uchun bosing yoki shu yerga torting</h3>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, DOCX, TXT (max 10 MB)
            </p>
          </>
        )}
      </div>
      
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Hujjatlarni qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {/* Documents List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">
            {search ? 'Hech narsa topilmadi' : 'Hujjat yo\'q'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Boshqa kalit so\'z bilan urinib ko\'ring' : 'Birinchi hujjatingizni yuklang'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-card border rounded-xl p-5 hover:shadow-md hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                {getStatusBadge(doc.status)}
              </div>
              
              <h3 className="font-semibold truncate" title={doc.title}>
                {doc.title}
              </h3>
              
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span>{doc.file_type?.toUpperCase()}</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                </div>
                {doc.word_count > 0 && (
                  <div className="flex items-center justify-between">
                    <span>{doc.word_count?.toLocaleString()} so'z</span>
                    <span>{doc.page_count} sahifa</span>
                  </div>
                )}
                <div>{formatDate(doc.created_at)}</div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={doc.status !== 'completed'}
                  onClick={() => handleStartChat(doc)}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(doc.id, doc.title)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;