import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Film, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { movies } from '@/data/movies';
import { Movie, Mood } from '@/types/movie';
import { cn } from '@/lib/utils';

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

// Mood keywords for NLP-like matching
const moodKeywords: Record<Mood, string[]> = {
  happy: ['xoşbəxt', 'şad', 'gülmək', 'komediya', 'əyləncəli', 'pozitiv', 'sevinc', 'happy', 'fun', 'comedy', 'laugh'],
  sad: ['kədərli', 'ağlamaq', 'dram', 'emosional', 'hüznlü', 'sad', 'cry', 'emotional', 'drama', 'touching'],
  excited: ['həyəcanlı', 'aksiya', 'triller', 'sürətli', 'macəra', 'excited', 'action', 'thriller', 'adventure', 'intense'],
  relax: ['rahat', 'sakit', 'istirahət', 'yüngül', 'relax', 'calm', 'peaceful', 'chill', 'easy'],
  thoughtful: ['düşüncəli', 'fəlsəfi', 'dərin', 'beyin', 'mürəkkəb', 'thoughtful', 'deep', 'philosophical', 'mind', 'complex'],
  romantic: ['romantik', 'sevgi', 'eşq', 'münasibət', 'romantic', 'love', 'relationship', 'couple']
};

// AI response templates
const greetings = [
  "Salam! 🎬 Mən sizin film köməkçinizəm. Bu gün hansı əhval-ruhiyyədəsiniz?",
  "Xoş gəlmisiniz! 🍿 Film seçməkdə sizə kömək edə bilərəm. Nə izləmək istərdiniz?",
];

const moodResponses: Record<Mood, string[]> = {
  happy: [
    "Əla! Şən əhval-ruhiyyə üçün gözəl seçimlərim var! 🌟",
    "Gülmək istəyirsiniz? Sizə mükəmməl komediyalar təklif edirəm! 😄",
  ],
  sad: [
    "Emosional bir gecə üçün dərin hisslər oyadan filmlər təklif edirəm. 💙",
    "Bəzən yaxşı bir dram ruha xeyir verir. İşte tövsiyələrim:",
  ],
  excited: [
    "Adrenalin istəyirsiniz? Həyəcanlı filmlər hazırdır! 🔥",
    "Aksiya və macəra? Gəlin! 💥",
  ],
  relax: [
    "Rahat bir axşam üçün sakit filmlər seçdim. 🌿",
    "İstirahət vaxtı! Yüngül və xoş filmlər burada:",
  ],
  thoughtful: [
    "Düşüncəli bir axşam üçün beyin açan filmlər! 🧠",
    "Dərin mənalı filmlər axtarırsınız? Baxın bunlara:",
  ],
  romantic: [
    "Romantik bir gecə üçün ən yaxşı seçimlər! 💕",
    "Eşq hekayələri? Sizin üçün xüsusi filmlər var! ❤️",
  ],
};

function detectMood(text: string): Mood | null {
  const lowerText = text.toLowerCase();
  
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return mood as Mood;
    }
  }
  return null;
}

function getRecommendations(
  mood: Mood | null, 
  favorites: string[], 
  watchLater: string[],
  count: number = 3
): Movie[] {
  let candidates = mood 
    ? movies.filter(m => m.mood === mood)
    : movies;
  
  // Prioritize unwatched movies
  candidates = candidates.sort((a, b) => {
    const aInList = favorites.includes(a.id) || watchLater.includes(a.id);
    const bInList = favorites.includes(b.id) || watchLater.includes(b.id);
    if (aInList && !bInList) return 1;
    if (!aInList && bInList) return -1;
    return b.rating - a.rating;
  });
  
  return candidates.slice(0, count);
}

function generateWhyText(movie: Movie): string {
  const reasons: Record<Mood, string[]> = {
    happy: [
      `${movie.title} sizə gülüş və pozitiv enerji bəxş edəcək.`,
      `Bu film xoş əhval-ruhiyyənizi daha da yaxşılaşdıracaq!`,
    ],
    sad: [
      `${movie.title} dərin emosiyalar yaşamaq istəyənlər üçün mükəmməldir.`,
      `Bu dram sizin hisslərinizi anlamağa kömək edəcək.`,
    ],
    excited: [
      `${movie.title} sizi ekrana yapışdıracaq həyəcanlı səhnələrlə doludur!`,
      `Adrenalin sevənlər üçün ideal seçim!`,
    ],
    relax: [
      `${movie.title} sakit bir axşam üçün mükəmməl seçimdir.`,
      `Rahatlamaq istəyirsinizsə, bu film tam sizlik!`,
    ],
    thoughtful: [
      `${movie.title} sizi düşündürəcək və uzun müddət ağlınızda qalacaq.`,
      `Dərin mənalı hekayə axtarırsınızsa, bu sizin üçün!`,
    ],
    romantic: [
      `${movie.title} ürəyinizi fəth edəcək gözəl bir sevgi hekayəsi.`,
      `Romantik bir gecə üçün ideal film!`,
    ],
  };
  
  const moodReasons = reasons[movie.mood];
  return moodReasons[Math.floor(Math.random() * moodReasons.length)];
}

function generateResponse(
  userMessage: string, 
  favorites: string[], 
  watchLater: string[]
): { content: string; recommendations?: Movie[] } {
  const lowerMessage = userMessage.toLowerCase();
  
  // Greeting detection
  if (lowerMessage.match(/(salam|hello|hi|hey|merhaba)/)) {
    return { 
      content: greetings[Math.floor(Math.random() * greetings.length)]
    };
  }
  
  // "What should I watch" type questions
  if (lowerMessage.match(/(nə baxım|ne baxim|nə izləyim|film tövsiyə|recommend|suggest|watch)/)) {
    const detectedMood = detectMood(userMessage);
    
    if (detectedMood) {
      const recommendations = getRecommendations(detectedMood, favorites, watchLater);
      const response = moodResponses[detectedMood][Math.floor(Math.random() * moodResponses[detectedMood].length)];
      return { content: response, recommendations };
    }
    
    // Random recommendations
    const randomMovies = getRecommendations(null, favorites, watchLater);
    return {
      content: "Budur sizin üçün seçdiyim maraqlı filmlər! Hansı əhval-ruhiyyədə olduğunuzu desəniz, daha dəqiq tövsiyələr verə bilərəm. 🎬",
      recommendations: randomMovies
    };
  }
  
  // Mood-specific requests
  const detectedMood = detectMood(userMessage);
  if (detectedMood) {
    const recommendations = getRecommendations(detectedMood, favorites, watchLater);
    const response = moodResponses[detectedMood][Math.floor(Math.random() * moodResponses[detectedMood].length)];
    return { content: response, recommendations };
  }
  
  // Default response
  return {
    content: "Mən sizə film tövsiyələri verə bilərəm! Sadəcə deyin: 'Bu gün nə baxım?' və ya əhval-ruhiyyənizi təsvir edin. Məsələn: 'Həyəcanlı bir şey istəyirəm' və ya 'Romantik film'. 🎬"
  };
}

const AIChatAssistant = ({ favorites, watchLater, onMovieSelect }: AIChatAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      setTimeout(() => {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: greetings[Math.floor(Math.random() * greetings.length)]
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
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      const response = generateResponse(input.trim(), favorites, watchLater);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        recommendations: response.recommendations
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
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
                              ⭐ {movie.rating} • {movie.year}
                            </p>
                            <p className="text-xs text-primary mt-1">
                              {generateWhyText(movie)}
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
