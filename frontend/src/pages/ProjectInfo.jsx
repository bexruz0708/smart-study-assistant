import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { chatAPI } from '@/api/chat.api';
import Button from '@/components/ui/Button';
import MarkdownContent from '@/components/chat/MarkdownContent';

const SUGGESTED_QUESTIONS = [
  'Bu loyihada qanday texnologiyalar ishlatilgan?',
  'Database modellari haqida ayting',
  'RAG tizimi nima va qanday ishlaydi?',
  'Nega Custom User Model yaratilgan?',
  'JWT va Session farqi nima?',
  'FAISS o\'rniga ChromaDB ishlatish mumkinmi?',
  'Loyihaning xavfsizlik tomonlari qanday?',
  'Frontend uchun nima ishlatiladi?',
  'Loyihaning kelajagi qanday?',
  'Custom User Model nima uchun yaratilgan?',
];

const ProjectInfo = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async (questionText = null) => {
    const question = (questionText || input).trim();
    if (!question || sending) return;
    
    if (!questionText) setInput('');
    
    const userMsg = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: question,
    };
    
    setMessages(prev => [...prev, userMsg]);
    setSending(true);
    
    try {
      const response = await chatAPI.askProjectInfo(question);
      
      const aiMsg = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        tokens_used: response.tokens_used,
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'AI javob bera olmadi';
      toast.error('Xato', { description: errorMsg });
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      if (!questionText) setInput(question);
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex p-3 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full mb-3">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Loyiha haqida AI yordamchi</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Bu sahifa loyiha haqida professional savollarga javob beradi. 
          
        </p>
      </div>
      
      {/* Welcome (faqat boshida) */}
      {messages.length === 0 && (
        <div className="bg-gradient-to-br from-blue-500/5 to-purple-600/5 border rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Tavsiya etilgan savollar</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Quyidagi savollardan birini tanlang yoki o'zingiz yozing
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={sending}
                className="text-left p-3 bg-card border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Messages */}
      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-card border rounded-tl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownContent content={msg.content} />
                  )}
                </div>
                
                {msg.tokens_used > 0 && (
                  <div className="text-xs text-muted-foreground mt-1 px-1">
                    {msg.tokens_used} token
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {sending && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-card border rounded-2xl rounded-tl-sm p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
      
      {/* Input */}
      <div className="sticky bottom-0 bg-background pt-4 -mx-6 px-6 pb-2 border-t">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Loyiha haqida savolingizni yozing..."
            rows={2}
            className="flex-1 resize-none px-3 py-2 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
          />
          <Button
            onClick={() => handleSend()}
            loading={sending}
            disabled={!input.trim() || sending}
            size="lg"
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;