import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Film, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Movie } from '@/types/movie';
import { cn } from '@/lib/utils';
import apiCall from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Movie[];
}

interface AIChatAssistantProps {
  favorites: string[];
  watchLater: string[];
  onMovieSelect?: (movie: Movie) => void;
}

interface AIResponse {
  content: string;
  recommendations?: Array<{
    id: string;
    title: string;
    posterUrl: string;
    rating: number;
    year: number;
    mood: string;
  }>;
}

const initialGreeting = "Salam! Bu gün nə izləmək istəyirsiniz? Əhval-ruhiyyənizə görə mükəmməl film tapmağınıza kömək edə bilərəm! 🎬";

const AIChatAssistant = ({ favorites, watchLater, onMovieSelect }: AIChatAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      setTimeout(() => {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: initialGreeting
        }]);
      }, 500);
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!user) {
      // Show message that user needs to login
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Please log in to use the AI assistant. I can help you find movies based on your preferences! 🔐"
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsTyping(true);
    
    try {
      // Call backend AI API
      const response = await apiCall<AIResponse>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: currentInput }),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        // Convert recommendations to Movie format
        const recommendations: Movie[] | undefined = response.data.recommendations?.map(rec => ({
          id: rec.id,
          title: rec.title,
          posterUrl: rec.posterUrl,
          rating: rec.rating,
          year: rec.year,
          duration: '',
          genres: [],
          mood: rec.mood as any,
          type: 'movie' as const,
          language: 'az',
        }));

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.content,
          recommendations
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble right now. Please try again later! 😔"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
          "transition-all duration-300 hover:scale-110",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <Bot className="w-6 h-6 text-primary-foreground" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-mood-happy rounded-full animate-pulse" />
      </Button>
      
      {/* Chat Window */}
      <div className={cn(
        "fixed bottom-6 right-6 z-50 w-[380px] h-[550px] rounded-2xl shadow-2xl overflow-hidden",
        "border border-border/50 bg-background/95 backdrop-blur-xl",
        "transition-all duration-300 origin-bottom-right",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Film Köməkçisi</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI ilə gücləndirilmiş
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Messages */}
        <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-br-md" 
                    : "bg-muted rounded-bl-md"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Movie Recommendations */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.recommendations.map((movie) => (
                        <div 
                          key={movie.id}
                          onClick={() => onMovieSelect?.(movie)}
                          className="flex gap-3 p-2 rounded-lg bg-background/50 hover:bg-background/80 cursor-pointer transition-colors"
                        >
                          <img 
                            src={movie.posterUrl} 
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate text-foreground">
                              {movie.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              ⭐ {movie.rating} • {movie.year} • {movie.mood}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-background/50">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Film haqqında soruşun..."
              className="flex-1 bg-muted/50 border-border/50"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Məsələn: "Bu gün nə baxım?" və ya "Romantik film istəyirəm"
          </p>
        </div>
      </div>
    </>
  );
};

export default AIChatAssistant;
