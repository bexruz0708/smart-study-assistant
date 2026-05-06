import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCw,
  Check,
  X,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { flashcardsAPI } from '@/api/flashcards.api';
import Button from '@/components/ui/Button';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';

const FlashcardStudy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    loadDeck();
  }, [id]);
  
  const loadDeck = async () => {
    try {
      setLoading(true);
      const data = await flashcardsAPI.get(id);
      setDeck(data);
    } catch (error) {
      toast.error('To\'plam yuklanmadi');
      navigate('/flashcards');
    } finally {
      setLoading(false);
    }
  };
  
  const currentCard = deck?.cards[currentIndex];
  
  const handleAnswer = async (isCorrect) => {
    try {
      await flashcardsAPI.reviewCard(currentCard.id, isCorrect);
    } catch (error) {
      // Silent fail
    }
    
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));
    
    if (currentIndex === deck.cards.length - 1) {
      setDone(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };
  
  const restart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setStats({ correct: 0, incorrect: 0 });
    setDone(false);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (!deck) return null;
  
  // RESULT
  if (done) {
    const total = stats.correct + stats.incorrect;
    const percentage = Math.round((stats.correct / total) * 100);
    
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-card border rounded-xl p-8 text-center">
          <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-3xl font-bold">Tugadi!</h2>
          <p className="text-muted-foreground mt-2">
            {deck.cards.length} ta karta o'rganildi
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
            <div className="bg-green-500/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
              <div className="text-xs text-muted-foreground">To'g'ri</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
              <div className="text-xs text-muted-foreground">Xato</div>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-lg font-medium">{percentage}% muvaffaqiyat</p>
          </div>
          
          <div className="flex gap-2 justify-center mt-6">
            <Button variant="outline" onClick={() => navigate('/flashcards')}>
              <ArrowLeft className="w-4 h-4" />
              To'plamlarga
            </Button>
            <Button onClick={restart}>
              <RefreshCw className="w-4 h-4" />
              Qaytadan
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const progress = ((currentIndex + 1) / deck.cards.length) * 100;
  
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/flashcards')}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          To'plamlarga
        </button>
        <h1 className="text-2xl font-bold">{deck.title}</h1>
      </div>
      
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Karta {currentIndex + 1} / {deck.cards.length}</span>
          <span>
            ✓ {stats.correct} • ✗ {stats.incorrect}
          </span>
        </div>
        <div className="bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="relative h-80 cursor-pointer perspective-1000"
        style={{ perspective: '1000px' }}
      >
        <div
          className={cn(
            'relative w-full h-full transition-transform duration-500',
            'preserve-3d'
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-card border-2 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Savol
            </p>
            <h3 className="text-2xl font-semibold">{currentCard.front}</h3>
            <p className="text-xs text-muted-foreground mt-6 inline-flex items-center gap-1">
              <RotateCw className="w-3 h-3" />
              Javobni ko'rish uchun bosing
            </p>
          </div>
          
          {/* Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-2 border-primary/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Javob
            </p>
            <p className="text-lg leading-relaxed">{currentCard.back}</p>
          </div>
        </div>
      </div>
      
      {/* Buttons */}
      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleAnswer(false)}
            className="border-red-500/30 hover:bg-red-500/10"
          >
            <X className="w-4 h-4 text-red-500" />
            Bilmadim
          </Button>
          <Button
            size="lg"
            onClick={() => handleAnswer(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4" />
            Bildim
          </Button>
        </div>
      ) : (
        <Button
          size="lg"
          variant="outline"
          onClick={() => setFlipped(true)}
          className="w-full"
        >
          <RotateCw className="w-4 h-4" />
          Javobni ko'rsatish
        </Button>
      )}
    </div>
  );
};

export default FlashcardStudy;