import { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAI } from '../../hooks/useAI';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello, I\'m your AI wellness companion. How are you feeling today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const { chatWithTherapist, loading } = useAI();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const response = await chatWithTherapist(input, messages);
    
    const aiMsg: Message = { 
      role: 'assistant', 
      content: response, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-sanctuary-accent/30">
        <div className="p-2 bg-sanctuary-glow/20 rounded-full">
          <Bot className="w-6 h-6 text-sanctuary-glow" />
        </div>
        <div>
          <h3 className="font-bold text-sanctuary-light">AI Wellness Guide</h3>
          <p className="text-xs text-sanctuary-light/50">Powered by OpenRouter</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`p-2 rounded-full ${msg.role === 'user' ? 'bg-sanctuary-accent' : 'bg-sanctuary-glow/20'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-sanctuary-glow" />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-sanctuary-accent text-sanctuary-light rounded-tr-none' 
                : 'bg-sanctuary-dark/50 text-sanctuary-light/90 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <span className="text-xs opacity-50 mt-1 block">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2 pt-4 border-t border-sanctuary-accent/30">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Share your thoughts..."
          className="flex-1 sanctuary-input"
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()}>
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
}
