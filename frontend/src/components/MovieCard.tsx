import { useState } from 'react';
import { Heart, Star, Play, Clock, Calendar, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Movie, Mood, Comment, UserReview } from '@/types/movie';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import MovieComments from '@/components/MovieComments';
import UserRating from '@/components/UserRating';

interface MovieCardProps {
  movie: Movie;
  isFavorite: boolean;
  isInWatchLater: boolean;
  onToggleFavorite: () => void;
  onToggleWatchLater: () => void;
  index: number;
  comments: Comment[];
  reviews: UserReview[];
  onAddReview: (movieId: string, username: string, rating: number, review: string) => void;
}

const moodAccent: Record<Mood, string> = {
  happy: 'hover:shadow-[0_10px_40px_-15px_hsl(45,100%,60%)]',
  sad: 'hover:shadow-[0_10px_40px_-15px_hsl(210,80%,55%)]',
  excited: 'hover:shadow-[0_10px_40px_-15px_hsl(10,90%,55%)]',
  relax: 'hover:shadow-[0_10px_40px_-15px_hsl(160,60%,45%)]',
  thoughtful: 'hover:shadow-[0_10px_40px_-15px_hsl(270,70%,55%)]',
  romantic: 'hover:shadow-[0_10px_40px_-15px_hsl(340,80%,60%)]',
};

const MovieCard = ({ 
  movie, 
  isFavorite, 
  isInWatchLater, 
  onToggleFavorite, 
  onToggleWatchLater, 
  index,
  reviews,
  onAddReview
}: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <div
      className={cn(
        'relative group rounded-2xl overflow-hidden bg-card border border-border/50',
        'transition-all duration-500 ease-out transform',
        'hover:scale-[1.02] hover:-translate-y-2',
        'opacity-0 animate-slide-up',
        moodAccent[movie.mood]
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer" />
        )}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className={cn(
            'w-full h-full object-cover transition-transform duration-700',
            'group-hover:scale-110',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button */}
        {movie.trailerUrl && (
          <Dialog>
            <DialogTrigger asChild>
              <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-glow-lg transform hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={movie.trailerUrl.replace('watch?v=', 'embed/')}
                  title={movie.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Favorite button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'bg-background/80 backdrop-blur-sm border border-border/50',
                  'transition-all duration-300 hover:scale-110',
                  isFavorite ? 'text-mood-romantic' : 'text-foreground/60 hover:text-mood-romantic'
                )}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {isFavorite ? 'Favoritlərdən çıxar' : 'Favoritlərə əlavə et'}
            </TooltipContent>
          </Tooltip>

          {/* Watch Later button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchLater();
                }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'bg-background/80 backdrop-blur-sm border border-border/50',
                  'transition-all duration-300 hover:scale-110',
                  isInWatchLater ? 'text-mood-thoughtful' : 'text-foreground/60 hover:text-mood-thoughtful'
                )}
              >
                {isInWatchLater ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <BookmarkPlus className="w-5 h-5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {isInWatchLater ? 'Siyahıdan çıxar' : 'Sonra bax'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Type badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm border-border/50"
        >
          {movie.type === 'movie' ? 'Film' : 'Serial'}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-mood-happy">
            <Star className="w-4 h-4" fill="currentColor" />
            <span className="font-semibold">{movie.rating}</span>
          </div>
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Calendar className="w-3.5 h-3.5" />
            <span>{movie.year}</span>
          </div>
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{movie.duration}</span>
          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5">
          {movie.genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="outline" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>

        {/* Comments & Reviews */}
        <MovieComments movieId={movie.id} />
        <UserRating
          movieId={movie.id}
          reviews={reviews}
          onAddReview={onAddReview}
        />
      </div>
    </div>
  );
};

export default MovieCard;
