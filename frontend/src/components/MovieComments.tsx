import { useState } from 'react';
import { MessageCircle, ThumbsUp, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface MovieCommentsProps {
  movieId: string;
}

const MovieComments = ({ movieId }: MovieCommentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const { comments, addComment, likeComment, isLoading } = useComments(movieId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Giriş tələb olunur',
        description: 'Şərh yazmaq üçün giriş edin',
        variant: 'destructive',
      });
      return;
    }

    if (content.trim()) {
      const result = await addComment(content.trim());
      if (result.error) {
        toast({
          title: 'Xəta',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setContent('');
      }
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast({
        title: 'Giriş tələb olunur',
        description: 'Bəyənmək üçün giriş edin',
        variant: 'destructive',
      });
      return;
    }

    const result = await likeComment(commentId);
    if (result.error) {
      toast({
        title: 'Xəta',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="mt-3 border-t border-border/30 pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{movieComments.length} şərh</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3 animate-fade-in">
          <ScrollArea className={cn("pr-2", movieComments.length > 3 && "h-48")}>
            <div className="space-y-3">
              {movieComments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  İlk şərhi sən yaz!
                </p>
              ) : (
                movieComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-lg bg-muted/30 border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{comment.username}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mb-2">{comment.content}</p>
                    <button
                      onClick={() => handleLike(comment.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-mood-romantic transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{comment.likes || 0}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <Textarea
                placeholder={user ? "Şərhinizi yazın..." : "Şərh yazmaq üçün giriş edin"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-sm min-h-[60px] resize-none flex-1"
                disabled={!user}
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0 self-end"
                disabled={!content.trim() || !user || isLoading}
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

export default MovieComments;
