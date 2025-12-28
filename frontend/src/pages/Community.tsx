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
import { Discussion, Mood, DiscussionReply } from '@/types/movie';
import { moods } from '@/data/moods';
import { movies } from '@/data/movies';
import { cn } from '@/lib/utils';

const moodColors: Record<Mood, string> = {
  happy: 'bg-mood-happy/20 text-mood-happy border-mood-happy/30 hover:bg-mood-happy/30',
  sad: 'bg-mood-sad/20 text-mood-sad border-mood-sad/30 hover:bg-mood-sad/30',
  excited: 'bg-mood-excited/20 text-mood-excited border-mood-excited/30 hover:bg-mood-excited/30',
  relax: 'bg-mood-relax/20 text-mood-relax border-mood-relax/30 hover:bg-mood-relax/30',
  thoughtful: 'bg-mood-thoughtful/20 text-mood-thoughtful border-mood-thoughtful/30 hover:bg-mood-thoughtful/30',
  romantic: 'bg-mood-romantic/20 text-mood-romantic border-mood-romantic/30 hover:bg-mood-romantic/30',
};

const defaultDiscussions: Discussion[] = [
  {
    id: '1',
    mood: 'happy',
    title: 'Hansı film sizi ən çox güldürdü?',
    description: 'Komediya janrında ən yaddaqalan filmlərinizi paylaşın!',
    username: 'FilmSevər',
    createdAt: new Date().toISOString(),
    replies: [
      {
        id: '1-1',
        username: 'Aynur',
        content: 'The Hangover seriyası məni hər dəfə güldürür!',
        createdAt: new Date().toISOString(),
        likes: 5,
      },
    ],
  },
  {
    id: '2',
    mood: 'romantic',
    title: 'Ən romantik film səhnəsi?',
    description: 'Ürəyinizi əritmış film səhnələrindən danışaq',
    username: 'RomantikRuh',
    createdAt: new Date().toISOString(),
    replies: [],
  },
  {
    id: '3',
    mood: 'thoughtful',
    title: 'Düşündürücü finalları olan filmlər',
    description: 'Sonuna qədər anlamadığınız və ya çox düşündürən finallar',
    username: 'Filosof',
    createdAt: new Date().toISOString(),
    replies: [
      {
        id: '3-1',
        username: 'Murad',
        content: 'Inception-un finalı hələ də yadımdadır!',
        createdAt: new Date().toISOString(),
        likes: 8,
      },
    ],
  },
];

const Community = () => {
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | 'all'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchLater, setWatchLater] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showWatchLater, setShowWatchLater] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedDiscussions = localStorage.getItem('discussions');
    if (savedDiscussions) {
      setDiscussions(JSON.parse(savedDiscussions));
    } else {
      setDiscussions(defaultDiscussions);
      localStorage.setItem('discussions', JSON.stringify(defaultDiscussions));
    }

    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    const savedWatchLater = localStorage.getItem('watchLater');
    if (savedWatchLater) setWatchLater(JSON.parse(savedWatchLater));
  }, []);

  // Save discussions to localStorage
  useEffect(() => {
    if (discussions.length > 0) {
      localStorage.setItem('discussions', JSON.stringify(discussions));
    }
  }, [discussions]);

  const handleCreateDiscussion = (mood: Mood, title: string, description: string, username: string) => {
    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      mood,
      title,
      description,
      username,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setDiscussions((prev) => [newDiscussion, ...prev]);
  };

  const handleAddReply = (discussionId: string, username: string, content: string) => {
    const newReply: DiscussionReply = {
      id: Date.now().toString(),
      username,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === discussionId
          ? { ...d, replies: [...d.replies, newReply] }
          : d
      )
    );
  };

  const handleLikeReply = (discussionId: string, replyId: string) => {
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === discussionId
          ? {
              ...d,
              replies: d.replies.map((r) =>
                r.id === replyId ? { ...r, likes: r.likes + 1 } : r
              ),
            }
          : d
      )
    );
  };

  const toggleFavorite = (movieId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const toggleWatchLater = (movieId: string) => {
    setWatchLater((prev) => {
      const newWatchLater = prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId];
      localStorage.setItem('watchLater', JSON.stringify(newWatchLater));
      return newWatchLater;
    });
  };

  const filteredDiscussions = selectedMood === 'all'
    ? discussions
    : discussions.filter((d) => d.mood === selectedMood);

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
            {filteredDiscussions.length === 0 ? (
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
        onRemoveFavorite={toggleFavorite}
      />

      <WatchLaterDrawer
        isOpen={showWatchLater}
        onClose={() => setShowWatchLater(false)}
        watchLater={watchLaterMovies}
        onRemoveFromWatchLater={toggleWatchLater}
      />
    </div>
  );
};

export default Community;
