import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Layers,
  Trash2,
  Play,
  FileText,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { flashcardsAPI } from '@/api/flashcards.api';
import { documentsAPI } from '@/api/documents.api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Loader from '@/components/common/Loader';
import { formatDate } from '@/lib/utils';

const Flashcards = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [generating, setGenerating] = useState(false);
  
  const [selectedDoc, setSelectedDoc] = useState('');
  const [cardCount, setCardCount] = useState(15);
  
  useEffect(() => {
    loadDecks();
  }, []);
  
  const loadDecks = async () => {
    try {
      setLoading(true);
      const data = await flashcardsAPI.list();
      setDecks(data.results || data || []);
    } catch (error) {
      toast.error('Kartochkalarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  };
  
  const openGenerate = async () => {
    try {
      const data = await documentsAPI.list();
      const docs = (data.results || data || []).filter(d => d.status === 'completed');
      setDocuments(docs);
      setShowGenerate(true);
    } catch (error) {
      toast.error('Hujjatlarni yuklashda xato');
    }
  };
  
  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!selectedDoc) {
      toast.error('Hujjat tanlang');
      return;
    }
    
    setGenerating(true);
    
    try {
      toast.info('AI kartochkalar yaratyapti...', {
        description: '30-60 soniya kuting',
      });
      
      const deck = await flashcardsAPI.generate(parseInt(selectedDoc), cardCount);
      
      toast.success('Kartochkalar yaratildi!', {
        description: `${deck.cards.length} ta karta`,
      });
      
      setShowGenerate(false);
      setSelectedDoc('');
      await loadDecks();
      
      navigate(`/flashcards/${deck.id}/study`);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Yaratishda xato';
      toast.error('Xato', { description: errorMsg });
    } finally {
      setGenerating(false);
    }
  };
  
  const handleDelete = async (id, title) => {
    if (!confirm(`"${title}" to'plamini o'chirasizmi?`)) return;
    
    try {
      await flashcardsAPI.delete(id);
      toast.success('To\'plam o\'chirildi');
      await loadDecks();
    } catch (error) {
      toast.error('O\'chirishda xato');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Flashkartalar</h1>
          <p className="text-muted-foreground mt-1">
            Yodlash uchun AI yordamida kartochkalar yarating
          </p>
        </div>
        <Button onClick={openGenerate}>
          <Plus className="w-4 h-4" />
          Yangi to'plam
        </Button>
      </div>
      
      {decks.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">Kartochkalar yo'q</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Birinchi to'plamingizni yarating va yodlashni boshlang
          </p>
          <Button onClick={openGenerate}>
            <Plus className="w-4 h-4" />
            To'plam yaratish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="bg-card border rounded-xl p-5 hover:shadow-md hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                  {deck.card_count} karta
                </span>
              </div>
              
              <h3 className="font-semibold truncate">{deck.title}</h3>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <FileText className="w-3 h-3" />
                <span className="truncate">{deck.document_title}</span>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                {formatDate(deck.created_at)}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/flashcards/${deck.id}/study`)}
                >
                  <Play className="w-4 h-4" />
                  O'rganish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(deck.id, deck.title)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Yangi to'plam yaratish</h3>
              <button
                onClick={() => setShowGenerate(false)}
                className="p-1 hover:bg-muted rounded"
                disabled={generating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <Label required>Hujjat</Label>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                    Tayyor hujjat yo'q
                  </p>
                ) : (
                  <select
                    value={selectedDoc}
                    onChange={(e) => setSelectedDoc(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={generating}
                  >
                    <option value="">Hujjat tanlang</option>
                    {documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <Label required>Kartochkalar soni</Label>
                <Input
                  type="number"
                  min="5"
                  max="30"
                  value={cardCount}
                  onChange={(e) => setCardCount(parseInt(e.target.value))}
                  disabled={generating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  5 dan 30 gacha
                </p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 text-sm">
                💡 AI kartochka yaratish 30-60 soniya vaqt oladi
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGenerate(false)}
                  disabled={generating}
                  className="flex-1"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  loading={generating}
                  disabled={!selectedDoc || generating}
                  className="flex-1"
                >
                  {!generating && <Layers className="w-4 h-4" />}
                  {generating ? 'Yaratilmoqda...' : 'Yaratish'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;