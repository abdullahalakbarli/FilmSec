import { useState, useEffect } from 'react';
import { ArrowLeft, Users, MessageSquare, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DiscussionCard from '@/components/DiscussionCard';
import CreateDiscussion from '@/components/CreateDiscussion';
import FavoritesDrawer from '@/components/FavoritesDrawer';
import WatchLaterDrawer from '@/components/WatchLaterDrawer';
import { Mood } from '@/types/movie';
import { moods } from '@/data/moods';
import { movies } from '@/data/movies';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { useWatchLater } from '@/hooks/useWatchLater';
import { useDiscussions } from '@/hooks/useDiscussions';
import { toast } from '@/hooks/use-toast';

const moodColors: Record<Mood, string> = {
  happy: 'bg-mood-happy/20 text-mood-happy border-mood-happy/30 hover:bg-mood-happy/30',
  sad: 'bg-mood-sad/20 text-mood-sad border-mood-sad/30 hover:bg-mood-sad/30',
  excited: 'bg-mood-excited/20 text-mood-excited border-mood-excited/30 hover:bg-mood-excited/30',
  relax: 'bg-mood-relax/20 text-mood-relax border-mood-relax/30 hover:bg-mood-relax/30',
  thoughtful: 'bg-mood-thoughtful/20 text-mood-thoughtful border-mood-thoughtful/30 hover:bg-mood-thoughtful/30',
  romantic: 'bg-mood-romantic/20 text-mood-romantic border-mood-romantic/30 hover:bg-mood-romantic/30',
};

// Discussions are now loaded from API via useDiscussions hook

const Community = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<Mood | 'all'>('all');
  const { favorites, toggleFavorite } = useFavorites();
  const { watchLater, toggleWatchLater } = useWatchLater();
  const { discussions, createDiscussion, addReply, likeReply, isLoading: discussionsLoading } = useDiscussions(selectedMood);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showWatchLater, setShowWatchLater] = useState(false);

  const handleCreateDiscussion = async (mood: Mood, title: string, description: string) => {
    const result = await createDiscussion(mood, title, description);
    if (result.error) {
      toast({
        title: 'Xəta',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleAddReply = async (discussionId: string, content: string) => {
    const result = await addReply(discussionId, content);
    if (result && result.error) {
      toast({
        title: 'Xəta',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleLikeReply = async (discussionId: string, replyId: string) => {
    const result = await likeReply(discussionId, replyId);
    if (result.error) {
      toast({
        title: 'Xəta',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleToggleFavorite = async (movieId: string) => {
    const result = await toggleFavorite(movieId);
    if (result.error) {
      toast({
        title: 'Xəta',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleToggleWatchLater = async (movieId: string) => {
    const result = await toggleWatchLater(movieId);
    if (result.error) {
      toast({
        title: 'Xəta',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  // Discussions are already filtered by mood in the API call
  const filteredDiscussions = discussions;

  const favoriteMovies = movies.filter((m) => favorites.includes(m.id));
  const watchLaterMovies = movies.filter((m) => watchLater.includes(m.id));

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        favoritesCount={favorites.length}
        watchLaterCount={watchLater.length}
        onFavoritesClick={() => setShowFavorites(true)}
        onWatchLaterClick={() => setShowWatchLater(true)}
        onLogoClick={() => navigate('/')}
      />

      <main className="flex-1 pt-20">
        <section className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Users className="w-7 h-7 text-primary" />
                  Cəmiyyət
                </h1>
                <p className="text-muted-foreground">
                  Film sevərlərlə müzakirə et
                </p>
              </div>
            </div>
            <CreateDiscussion onCreateDiscussion={handleCreateDiscussion} />
          </div>

          {/* Mood Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge
              variant="outline"
              className={cn(
                "cursor-pointer transition-colors border",
                selectedMood === 'all' && 'bg-primary text-primary-foreground border-primary'
              )}
              onClick={() => setSelectedMood('all')}
            >
              <Filter className="w-3 h-3 mr-1" />
              Hamısı
            </Badge>
            {moods.map((m) => (
              <Badge
                key={m.id}
                variant="outline"
                className={cn(
                  "cursor-pointer transition-colors border",
                  selectedMood === m.id ? moodColors[m.id] : 'hover:bg-muted'
                )}
                onClick={() => setSelectedMood(m.id)}
              >
                {m.emoji} {m.name}
              </Badge>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {filteredDiscussions.length} müzakirə
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {filteredDiscussions.reduce((acc, d) => acc + d.replies.length, 0)} cavab
            </span>
          </div>

          {/* Discussions */}
          <div className="space-y-4">
            {discussionsLoading ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Yüklənir...</p>
              </div>
            ) : filteredDiscussions.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Müzakirə yoxdur</h3>
                <p className="text-muted-foreground">
                  İlk müzakirəni sən başlat!
                </p>
              </div>
            ) : (
              filteredDiscussions.map((discussion) => (
                <DiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  onAddReply={handleAddReply}
                  onLikeReply={handleLikeReply}
                />
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />

      <FavoritesDrawer
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        favorites={favoriteMovies}
        onRemoveFavorite={handleToggleFavorite}
      />

      <WatchLaterDrawer
        isOpen={showWatchLater}
        onClose={() => setShowWatchLater(false)}
        watchLater={watchLaterMovies}
        onRemoveFromWatchLater={handleToggleWatchLater}
      />
    </div>
  );
};

export default Community;
