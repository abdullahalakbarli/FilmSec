import { Heart, X, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types/movie';
import { cn } from '@/lib/utils';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Movie[];
  onRemoveFavorite: (id: string) => void;
}

const FavoritesDrawer = ({ isOpen, onClose, favorites, onRemoveFavorite }: FavoritesDrawerProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="glass border-l border-border/30 w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-mood-romantic" fill="currentColor" />
            Favoritlərim
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Hələ heç bir favorit əlavə etməmisiniz
              </p>
            </div>
          ) : (
            favorites.map((movie, index) => (
              <div
                key={movie.id}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-xl bg-card/50 border border-border/30',
                  'transition-all duration-300 hover:bg-card',
                  'opacity-0 animate-slide-up'
                )}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold line-clamp-1">{movie.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {movie.year} · {movie.rating} ⭐
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveFavorite(movie.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FavoritesDrawer;
