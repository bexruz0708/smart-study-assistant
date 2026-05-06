import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  RefreshCw,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { quizzesAPI } from '@/api/quizzes.api';
import Button from '@/components/ui/Button';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    loadQuiz();
  }, [id]);
  
  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizzesAPI.get(id);
      setQuiz(data);
    } catch (error) {
      toast.error('Test yuklanmadi');
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };
  
  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      if (!confirm(`${unanswered.length} ta savolga javob bermadingiz. Davom etasizmi?`)) {
        return;
      }
    }
    
    setSubmitting(true);
    try {
      const data = await quizzesAPI.submit(id, answers);
      setResult(data);
      setShowResult(true);
      toast.success(`Natija: ${data.score}%`, {
        description: `${data.correct_count} / ${data.total_questions} to'g'ri`,
      });
    } catch (error) {
      toast.error('Yuborishda xato');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDownloadPDF = async () => {
    if (!result) return;
    
    setDownloading(true);
    try {
      await quizzesAPI.downloadAttemptPDF(result.id);
      toast.success('PDF yuklab olindi!');
    } catch (error) {
      toast.error('PDF yuklab olinmadi');
    } finally {
      setDownloading(false);
    }
  };
  
  const restart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setShowResult(false);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (!quiz) return null;
  
  // RESULT SCREEN
  if (showResult && result) {
    const percentage = result.score;
    const isExcellent = percentage >= 80;
    const isGood = percentage >= 60;
    
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-card border rounded-xl p-8 text-center">
          <div className={cn(
            'inline-flex p-4 rounded-full mb-4',
            isExcellent ? 'bg-green-500/10' : isGood ? 'bg-yellow-500/10' : 'bg-red-500/10'
          )}>
            <Trophy className={cn(
              'w-10 h-10',
              isExcellent ? 'text-green-600' : isGood ? 'text-yellow-600' : 'text-red-600'
            )} />
          </div>
          
          <h2 className="text-3xl font-bold">{percentage}%</h2>
          <p className="text-muted-foreground mt-2">
            {result.correct_count} / {result.total_questions} to'g'ri javob
          </p>
          
          <div className="mt-4">
            <p className="text-lg font-medium">
              {isExcellent ? '🎉 A\'lo natija!' : isGood ? '👍 Yaxshi!' : '💪 Yana harakat qilib ko\'ring'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <Button variant="outline" onClick={() => navigate('/quizzes')}>
              <ArrowLeft className="w-4 h-4" />
              Testlarga qaytish
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF} loading={downloading}>
              <Download className="w-4 h-4" />
              PDF yuklab olish
            </Button>
            <Button onClick={restart}>
              <RefreshCw className="w-4 h-4" />
              Qaytadan
            </Button>
          </div>
        </div>
        
        {/* Javoblarni ko'rish */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Javoblar tahlili</h3>
          {result.questions_with_answers.map((q, i) => {
            const userAnswer = result.answers[q.id];
            const isCorrect = userAnswer === q.correct_answer;
            
            return (
              <div
                key={q.id}
                className={cn(
                  'bg-card border rounded-xl p-5',
                  isCorrect ? 'border-green-500/30' : 'border-red-500/30'
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    'p-1 rounded-full flex-shrink-0',
                    isCorrect ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                  )}>
                    {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Savol {i + 1}</p>
                    <h4 className="font-semibold mt-1">{q.question_text}</h4>
                  </div>
                </div>
                
                <div className="space-y-1.5 ml-8">
                  {Object.entries(q.options).map(([key, value]) => {
                    const isThisCorrect = key === q.correct_answer;
                    const isUserAnswer = key === userAnswer;
                    
                    return (
                      <div
                        key={key}
                        className={cn(
                          'p-2 rounded text-sm flex items-center gap-2',
                          isThisCorrect && 'bg-green-500/10 text-green-700 dark:text-green-400 font-medium',
                          isUserAnswer && !isThisCorrect && 'bg-red-500/10 text-red-700 dark:text-red-400'
                        )}
                      >
                        <span className="font-bold w-5">{key}.</span>
                        <span className="flex-1">{value}</span>
                        {isThisCorrect && <CheckCircle2 className="w-4 h-4" />}
                        {isUserAnswer && !isThisCorrect && <XCircle className="w-4 h-4" />}
                      </div>
                    );
                  })}
                </div>
                
                {q.explanation && (
                  <div className="mt-3 ml-8 p-3 bg-blue-500/5 border-l-2 border-blue-500 rounded text-sm">
                    💡 <span className="text-muted-foreground">{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  // TEST SCREEN
  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/quizzes')}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Testlarga qaytish
        </button>
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {answeredCount} / {totalQuestions} javob berildi
        </p>
      </div>
      
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Savol {currentIndex + 1} / {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Question */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          {currentQuestion.question_text}
        </h2>
        
        <div className="space-y-2">
          {Object.entries(currentQuestion.options).map(([key, value]) => {
            const isSelected = answers[currentQuestion.id] === key;
            
            return (
              <button
                key={key}
                onClick={() => handleAnswer(currentQuestion.id, key)}
                className={cn(
                  'w-full p-3 rounded-lg border-2 text-left transition-all flex items-center gap-3',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold flex-shrink-0',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border'
                )}>
                  {key}
                </div>
                <span className="flex-1">{value}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Oldingi
        </Button>
        
        <div className="flex gap-1">
          {quiz.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                'w-8 h-8 rounded-md text-xs font-semibold transition-colors',
                i === currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : answers[q.id]
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        
        {currentIndex === totalQuestions - 1 ? (
          <Button onClick={handleSubmit} loading={submitting}>
            Yakunlash
          </Button>
        ) : (
          <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
            Keyingi
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizDetail;