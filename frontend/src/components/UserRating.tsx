import { useState } from 'react';
import { Star, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserReview } from '@/types/movie';
import { cn } from '@/lib/utils';

interface UserRatingProps {
  movieId: string;
  reviews: UserReview[];
  onAddReview: (movieId: string, username: string, rating: number, review: string) => void;
}

const UserRating = ({ movieId, reviews, onAddReview }: UserRatingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  const movieReviews = reviews.filter((r) => r.movieId === movieId);
  const averageRating = movieReviews.length > 0
    ? (movieReviews.reduce((acc, r) => acc + r.rating, 0) / movieReviews.length).toFixed(1)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && rating > 0 && review.trim()) {
      onAddReview(movieId, username.trim(), rating, review.trim());
      setRating(0);
      setReview('');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="border-t border-border/30 pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Star className="w-4 h-4" />
        <span>
          {movieReviews.length} rəy
          {averageRating && (
            <span className="ml-1 text-mood-happy">({averageRating} ★)</span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3 animate-fade-in">
          <ScrollArea className={cn("pr-2", movieReviews.length > 2 && "h-40")}>
            <div className="space-y-3">
              {movieReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  İlk rəyi sən yaz!
                </p>
              ) : (
                movieReviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg bg-muted/30 border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{r.username}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3 h-3",
                                i < r.rating ? "text-mood-happy fill-mood-happy" : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80">{r.review}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              placeholder="Adınız"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-sm h-9"
            />
            
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-5 h-5 transition-colors",
                      (hoverRating || rating) >= star
                        ? "text-mood-happy fill-mood-happy"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                {rating > 0 ? `${rating}/5` : 'Qiymətləndir'}
              </span>
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Rəyinizi yazın..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="text-sm min-h-[60px] resize-none flex-1"
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0 self-end"
                disabled={!username.trim() || rating === 0 || !review.trim()}
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

export default UserRating;
