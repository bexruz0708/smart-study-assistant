import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  User,
  Bot,
  ChevronRight,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { chatAPI } from '@/api/chat.api';
import { documentsAPI } from '@/api/documents.api';
import Button from '@/components/ui/Button';
import Loader from '@/components/common/Loader';
import MarkdownContent from '@/components/chat/MarkdownContent';
import { formatDate, truncate } from '@/lib/utils';

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionIdParam = searchParams.get('session');
  
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);
  const [documents, setDocuments] = useState([]);
  
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    loadSessions();
  }, []);
  
  useEffect(() => {
    if (sessionIdParam) {
      loadSession(sessionIdParam);
    }
  }, [sessionIdParam]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await chatAPI.listSessions();
      const sessionsList = data.results || data || [];
      setSessions(sessionsList.filter(s => s.session_type === 'document'));
      
      if (!sessionIdParam && sessionsList.length > 0) {
        const firstSession = sessionsList.find(s => s.session_type === 'document');
        if (firstSession) {
          setSearchParams({ session: firstSession.id });
        }
      }
    } catch (error) {
      toast.error('Suhbatlarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  };
  
  const loadSession = async (id) => {
    try {
      const data = await chatAPI.getSession(id);
      setActiveSession(data);
      setMessages(data.messages || []);
    } catch (error) {
      toast.error('Suhbatni yuklashda xato');
      setSearchParams({});
    }
  };
  
  const loadDocuments = async () => {
    try {
      const data = await documentsAPI.list();
      const docs = data.results || data || [];
      setDocuments(docs.filter(d => d.status === 'completed'));
    } catch (error) {
      toast.error('Hujjatlarni yuklashda xato');
    }
  };
  
  const handleNewSession = async (documentId) => {
    try {
      const doc = documents.find(d => d.id === documentId);
      const session = await chatAPI.createSession(documentId, `Chat: ${doc?.title}`);
      
      toast.success('Yangi suhbat yaratildi');
      setShowNewSession(false);
      await loadSessions();
      setSearchParams({ session: session.id });
    } catch (error) {
      toast.error('Suhbat yaratishda xato');
    }
  };
  
  const handleDeleteSession = async (id) => {
    if (!confirm('Suhbatni o\'chirmoqchimisiz?')) return;
    
    try {
      await chatAPI.deleteSession(id);
      toast.success('Suhbat o\'chirildi');
      await loadSessions();
      
      if (activeSession?.id === id) {
        setActiveSession(null);
        setMessages([]);
        setSearchParams({});
      }
    } catch (error) {
      toast.error('O\'chirishda xato');
    }
  };
  
  const handleSend = async () => {
    if (!input.trim() || !activeSession || sending) return;
    
    const question = input.trim();
    setInput('');
    
    // User xabarini darhol ko'rsatish
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: question,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setSending(true);
    
    try {
      const response = await chatAPI.ask(activeSession.id, question);
      
      // Vaqtinchalik xabarni almashtirish
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [...filtered, response.user_message, response.ai_message];
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'AI javob bera olmadi';
      toast.error('Xato', { description: errorMsg });
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
      setInput(question);
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
  
  const openNewSessionModal = async () => {
    await loadDocuments();
    setShowNewSession(true);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4 -m-6 p-6">
      {/* Sessions Sidebar */}
      <div className="w-72 bg-card border rounded-xl flex flex-col flex-shrink-0">
        <div className="p-4 border-b">
          <Button
            onClick={openNewSessionModal}
            className="w-full"
          >
            <Plus className="w-4 h-4" />
            Yangi suhbat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Suhbat yo'q
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSearchParams({ session: session.id })}
                className={`w-full p-3 rounded-lg mb-1 text-left group transition-colors ${
                  activeSession?.id === session.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm">{session.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                      activeSession?.id === session.id
                        ? 'hover:bg-primary-foreground/20'
                        : 'hover:bg-destructive/10'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 bg-card border rounded-xl flex flex-col min-w-0">
        {!activeSession ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md p-6">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">AI bilan suhbatni boshlang</h2>
              <p className="text-muted-foreground mb-6">
                Hujjatingizni tanlang va AI'dan istalgan savolingizni so'rang
              </p>
              <Button onClick={openNewSessionModal}>
                <Plus className="w-4 h-4" />
                Yangi suhbat boshlash
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b">
              <h3 className="font-semibold truncate">{activeSession.title}</h3>
              {activeSession.document_title && (
                <p className="text-xs text-muted-foreground truncate">
                  📄 {activeSession.document_title}
                </p>
              )}
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Birinchi savolingizni yozing
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
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
                    
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                      <div className={`p-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted rounded-tl-sm'
                      }`}>
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <MarkdownContent content={msg.content} />
                        )}
                      </div>
                      
                      {msg.sources?.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            📚 {msg.sources.length} ta manba
                          </summary>
                          <div className="mt-2 space-y-2">
                            {msg.sources.map((source, i) => (
                              <div
                                key={i}
                                className="p-2 bg-muted rounded text-xs text-muted-foreground"
                              >
                                {source.text}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {sending && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
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
            
            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Savolingizni yozing... (Enter — yuborish, Shift+Enter — yangi qator)"
                  rows={2}
                  className="flex-1 resize-none px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={sending}
                />
                <Button
                  onClick={handleSend}
                  loading={sending}
                  disabled={!input.trim() || sending}
                  size="lg"
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* New Session Modal */}
      {showNewSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Hujjat tanlang</h3>
              <button
                onClick={() => setShowNewSession(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {documents.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Hozircha tayyor hujjat yo'q
                  </p>
                  <Button onClick={() => {
                    setShowNewSession(false);
                    navigate('/documents');
                  }}>
                    Hujjat yuklash
                  </Button>
                </div>
              ) : (
                documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleNewSession(doc.id)}
                    className="w-full p-3 rounded-lg hover:bg-muted text-left flex items-center gap-3 group"
                  >
                    <div className="p-2 bg-primary/10 rounded">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.word_count?.toLocaleString()} so'z
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;