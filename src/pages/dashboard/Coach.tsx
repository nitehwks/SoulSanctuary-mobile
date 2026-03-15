import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAI } from '../../hooks/useAI';
import { 
  Send, User, Sparkles, TrendingUp, Target, 
  Smile, Brain, ChevronDown, Lightbulb, Heart, Cross, Bot
} from 'lucide-react';
import { useSanctuary } from '../../context/SanctuaryContext';
import { useAuth } from '../../context/AuthContext';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  metadata?: {
    scripture?: string;
    exercise?: string;
    technique?: string;
  };
}

interface QuickPrompt {
  icon: typeof Smile;
  label: string;
  prompt: string;
}

const quickPrompts: QuickPrompt[] = [
  { icon: Smile, label: 'How am I feeling?', prompt: 'Based on my recent mood entries, how have I been feeling and what patterns do you see?' },
  { icon: Target, label: 'Goal help', prompt: 'I need help with my goals. What should I focus on?' },
  { icon: Brain, label: 'Process emotions', prompt: 'I want to process some emotions I\'ve been feeling. Can you help me work through them?' },
  { icon: TrendingUp, label: 'Progress check', prompt: 'How am I progressing with my mental health journey?' },
  { icon: Heart, label: 'Scripture comfort', prompt: 'I could use some scriptural encouragement today. What verses might help me?' },
  { icon: Lightbulb, label: 'Daily insight', prompt: 'What insight can you share with me today?' },
];

type ChatMode = 'spiritual' | 'general';

const modeConfigs = {
  spiritual: {
    title: 'Spiritual Companion',
    icon: Cross,
    greeting: "Welcome to your sanctuary. I'm here to walk alongside you on your journey toward peace and wholeness. How can I support you today?",
    suggestions: ['I\'m feeling anxious', 'I need encouragement', 'Help me with my goals', 'Share a prayer with me'],
    systemPrompt: 'spiritual'
  },
  general: {
    title: 'AI Chatbot',
    icon: Bot,
    greeting: "Hi there! I'm your AI assistant. I can help with questions, conversation, or just chat. What would you like to talk about?",
    suggestions: ['Tell me a joke', 'Help me relax', 'What can you do?', 'I need advice'],
    systemPrompt: 'general'
  }
};

export default function Coach() {
  const [chatMode, setChatMode] = useState<ChatMode>('spiritual');
  const currentMode = modeConfigs[chatMode];
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: modeConfigs.spiritual.greeting, 
      timestamp: new Date(),
      suggestions: modeConfigs.spiritual.suggestions
    }
  ]);
  const [input, setInput] = useState('');
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [isResponding, setIsResponding] = useState(false);

  // Switch mode function
  const switchMode = (mode: ChatMode) => {
    setChatMode(mode);
    setMessages([
      {
        role: 'assistant',
        content: modeConfigs[mode].greeting,
        timestamp: new Date(),
        suggestions: modeConfigs[mode].suggestions
      }
    ]);
    setShowQuickPrompts(true);
  };
  
  const { chatWithTherapist } = useAI();
  const { currentMood, activeGoals } = useSanctuary();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(async (text: string = input) => {
    if (!text.trim() || isResponding) return;
    
    setIsResponding(true);
    setShowQuickPrompts(false);
    
    // Add user message immediately
    const userMsg: Message = { 
      role: 'user', 
      content: text, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      // Get recent messages for context (last 10)
      const contextMessages = messages.filter(m => m.role !== 'system').slice(-10);
      
      // Call the API
      const response = await chatWithTherapist(text, contextMessages, chatMode);
      
      // Add AI response
      const aiMsg: Message = { 
        role: 'assistant', 
        content: response, 
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMsg: Message = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsResponding(false);
    }
  }, [input, isResponding, messages, chatWithTherapist, chatMode]);

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    handleSend(prompt.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const ModeIcon = currentMode.icon;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-sanctuary-gold/30 rounded-2xl animate-pulse" />
            <div className="relative p-3 bg-black/30 backdrop-blur-sm rounded-2xl border border-sanctuary-gold/40">
              <ModeIcon className="w-7 h-7 text-sanctuary-gold" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-sanctuary-cream text-shadow">{currentMode.title}</h1>
            <p className="text-sm text-sanctuary-cream/70 text-shadow">
              {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! I'm here to support you.
            </p>
          </div>
        </div>
        
        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-xl p-1 border border-white/10">
          <button
            onClick={() => switchMode('spiritual')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              chatMode === 'spiritual'
                ? 'bg-sanctuary-gold/30 text-sanctuary-gold border border-sanctuary-gold/50'
                : 'text-sanctuary-cream/60 hover:text-sanctuary-cream'
            }`}
          >
            <Cross className="w-4 h-4 inline mr-1" />
            Coach
          </button>
          <button
            onClick={() => switchMode('general')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              chatMode === 'general'
                ? 'bg-sanctuary-gold/30 text-sanctuary-gold border border-sanctuary-gold/50'
                : 'text-sanctuary-cream/60 hover:text-sanctuary-cream'
            }`}
          >
            <Bot className="w-4 h-4 inline mr-1" />
            Chat
          </button>
        </div>
        
        {/* Status indicators */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          {currentMood && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
              <Smile className="w-4 h-4 text-sanctuary-gold" />
              <span className="text-sanctuary-cream/80">Mood: {currentMood.mood}/5</span>
            </div>
          )}
          {activeGoals.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
              <Target className="w-4 h-4 text-sanctuary-gold" />
              <span className="text-sanctuary-cream/80">{activeGoals.length} goals</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden bg-black/40 backdrop-blur-md border-white/10">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 scroll-smooth-touch">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-sanctuary-gold/30 border border-sanctuary-gold/50' 
                  : 'bg-black/40 border border-sanctuary-gold/30'
              }`}>
                {msg.role === 'user' 
                  ? <User className="w-5 h-5 text-sanctuary-cream" /> 
                  : <Cross className="w-5 h-5 text-sanctuary-gold" />
                }
              </div>
              
              <div className={`max-w-[85%] md:max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-sanctuary-gold/20 text-sanctuary-cream rounded-tr-none border border-sanctuary-gold/30' 
                    : 'bg-black/30 text-sanctuary-cream/90 rounded-tl-none border border-white/10'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {msg.suggestions && msg.suggestions.length > 0 && chatMode === 'spiritual' && (
                  <div className="flex flex-wrap gap-2">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(suggestion)}
                        className="px-3 py-1.5 text-xs bg-sanctuary-gold/20 hover:bg-sanctuary-gold/30 
                                   text-sanctuary-gold rounded-full transition-colors border border-sanctuary-gold/30"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <span className="text-xs text-sanctuary-cream/40 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isResponding && (
            <div className="flex gap-3">
              <div className="p-2.5 rounded-xl bg-black/40 border border-sanctuary-gold/30">
                <Cross className="w-5 h-5 text-sanctuary-gold" />
              </div>
              <div className="p-4 rounded-2xl bg-black/30 rounded-tl-none border border-white/10">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-sanctuary-gold/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-sanctuary-gold/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-sanctuary-gold/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>

        {/* Quick Prompts */}
        {showQuickPrompts && (
          <div className="px-4 py-3 border-t border-white/10 bg-black/20">
            <p className="text-xs text-sanctuary-cream/50 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sanctuary-gold" /> Conversation starters
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="flex items-center gap-2 px-3 py-2 bg-sanctuary-gold/20 hover:bg-sanctuary-gold/30 
                             rounded-xl text-sm text-sanctuary-cream whitespace-nowrap transition-colors
                             border border-sanctuary-gold/30"
                >
                  <prompt.icon className="w-4 h-4 text-sanctuary-gold" />
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/30">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts, prayers, or ask for guidance..."
                className="w-full sanctuary-input pr-12 py-3"
                disabled={isResponding}
              />
              <button
                onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-sanctuary-cream/40 
                           hover:text-sanctuary-gold transition-colors"
                title="Quick prompts"
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${showQuickPrompts ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <Button 
              onClick={() => handleSend()} 
              disabled={isResponding || !input.trim()}
              className="px-4 py-3"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-sanctuary-cream/40 mt-2 text-center">
            Press Enter to send • Your conversations are private and secure
          </p>
        </div>
      </Card>
    </div>
  );
}
