import { useState } from 'react';
import { MessageSquare, ThumbsUp, Send, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Discussion, Mood } from '@/types/movie';
import { cn } from '@/lib/utils';
import { moods } from '@/data/moods';

import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface DiscussionCardProps {
  discussion: Discussion;
  onAddReply: (discussionId: string, content: string) => Promise<{ error?: string }>;
  onLikeReply: (discussionId: string, replyId: string) => Promise<{ error?: string }>;
}

const moodColors: Record<Mood, string> = {
  happy: 'bg-mood-happy/20 text-mood-happy border-mood-happy/30',
  sad: 'bg-mood-sad/20 text-mood-sad border-mood-sad/30',
  excited: 'bg-mood-excited/20 text-mood-excited border-mood-excited/30',
  relax: 'bg-mood-relax/20 text-mood-relax border-mood-relax/30',
  thoughtful: 'bg-mood-thoughtful/20 text-mood-thoughtful border-mood-thoughtful/30',
  romantic: 'bg-mood-romantic/20 text-mood-romantic border-mood-romantic/30',
};

const DiscussionCard = ({ discussion, onAddReply, onLikeReply }: DiscussionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const { user } = useAuth();

  const moodInfo = moods.find((m) => m.id === discussion.mood);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Giriş tələb olunur',
        description: 'Cavab yazmaq üçün giriş edin',
        variant: 'destructive',
      });
      return;
    }

    const trimmedContent = content.trim();
    console.log('DiscussionCard handleSubmit:', { content, trimmedContent, length: trimmedContent.length });
    
    if (!trimmedContent || trimmedContent.length === 0) {
      toast({
        title: 'Xəta',
        description: 'Cavab boş ola bilməz',
        variant: 'destructive',
      });
      return;
    }

    const result = await onAddReply(discussion.id, trimmedContent);
    if (result && !result.error) {
      setContent('');
    } else if (result && result.error) {
      toast({
        title: 'Xəta',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleLike = async (replyId: string) => {
    if (!user) {
      toast({
        title: 'Giriş tələb olunur',
        description: 'Bəyənmək üçün giriş edin',
        variant: 'destructive',
      });
      return;
    }

    await onLikeReply(discussion.id, replyId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn("border", moodColors[discussion.mood])}>
              {moodInfo?.emoji} {moodInfo?.name}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(discussion.createdAt)}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-1">{discussion.title}</h3>
          <p className="text-sm text-muted-foreground">{discussion.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>{discussion.username}</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{discussion.replies.length} cavab</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border/30 animate-fade-in">
          <ScrollArea className={cn("pr-2", discussion.replies.length > 3 && "h-60")}>
            <div className="space-y-3">
              {discussion.replies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  İlk cavabı sən yaz!
                </p>
              ) : (
                discussion.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-3 rounded-lg bg-muted/30 border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{reply.username}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mb-2">{reply.content}</p>
                    <button
                      onClick={() => handleLike(reply.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-mood-romantic transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{reply.likes || 0}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <div className="flex gap-2">
              <Textarea
                placeholder={user ? "Cavabınızı yazın..." : "Cavab yazmaq üçün giriş edin"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-sm min-h-[60px] resize-none flex-1"
                disabled={!user}
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0 self-end"
                disabled={!content.trim() || !user}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DiscussionCard;
