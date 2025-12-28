import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, RefreshCw, SlidersHorizontal, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MoodCard from '@/components/MoodCard';
import MovieCard from '@/components/MovieCard';
import FilterPanel from '@/components/FilterPanel';
import FavoritesDrawer from '@/components/FavoritesDrawer';
import WatchLaterDrawer from '@/components/WatchLaterDrawer';
import RandomMoodButton from '@/components/RandomMoodButton';
import SkeletonCard from '@/components/SkeletonCard';
import AIChatAssistant from '@/components/AIChatAssistant';
import { Button } from '@/components/ui/button';
import { moods } from '@/data/moods';
import { movies } from '@/data/movies';
import { Mood, Filters, Movie, Comment, UserReview } from '@/types/movie';
import { cn } from '@/lib/utils';

const defaultFilters: Filters = {
  type: 'all',
  duration: 'any',
  language: 'any',
};

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watchLater, setWatchLater] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showWatchLater, setShowWatchLater] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    const savedWatchLater = localStorage.getItem('watchLater');
    if (savedWatchLater) setWatchLater(JSON.parse(savedWatchLater));

    const savedComments = localStorage.getItem('comments');
    if (savedComments) setComments(JSON.parse(savedComments));

    const savedReviews = localStorage.getItem('reviews');
    if (savedReviews) setReviews(JSON.parse(savedReviews));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('watchLater', JSON.stringify(watchLater));
  }, [watchLater]);

  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  const filteredMovies = useMemo(() => {
    if (!selectedMood) return [];

    return movies.filter((movie) => {
      if (movie.mood !== selectedMood) return false;
      if (filters.type !== 'all' && movie.type !== filters.type) return false;
      if (filters.language !== 'any' && movie.language !== filters.language) return false;
      return true;
    });
  }, [selectedMood, filters]);

  const favoriteMovies = useMemo(() => {
    return movies.filter((movie) => favorites.includes(movie.id));
  }, [favorites]);

  const watchLaterMovies = useMemo(() => {
    return movies.filter((movie) => watchLater.includes(movie.id));
  }, [watchLater]);

  const handleMoodSelect = (mood: Mood) => {
    setIsLoading(true);
    setSelectedMood(mood);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleRandomMood = () => {
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    handleMoodSelect(randomMood.id);
  };

  const handleNextRecommendation = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  const toggleFavorite = (movieId: string) => {
    setFavorites((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );
  };

  const toggleWatchLater = (movieId: string) => {
    setWatchLater((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );
  };

  const handleAddComment = (movieId: string, username: string, content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      movieId,
      username,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    setComments((prev) => [...prev, newComment]);
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      )
    );
  };

  const handleAddReview = (movieId: string, username: string, rating: number, review: string) => {
    const newReview: UserReview = {
      id: Date.now().toString(),
      movieId,
      username,
      rating,
      review,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [...prev, newReview]);
  };

  const currentMoodInfo = moods.find((m) => m.id === selectedMood);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        favoritesCount={favorites.length}
        watchLaterCount={watchLater.length}
        onFavoritesClick={() => setShowFavorites(true)}
        onWatchLaterClick={() => setShowWatchLater(true)}
        onLogoClick={() => setSelectedMood(null)}
      />

      <main className="flex-1 pt-20">
        {!selectedMood ? (
          // Mood Selection View
          <section className="container mx-auto px-4 py-12">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Bu gün hansı <span className="text-gradient">mood</span>-dasan?
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Əhvalına uyğun film və seriallar tap
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mb-8">
              {moods.map((mood, index) => (
                <MoodCard
                  key={mood.id}
                  mood={mood}
                  isSelected={selectedMood === mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                  index={index}
                />
              ))}
            </div>

            <div className="flex justify-center animate-fade-in" style={{ animationDelay: '700ms' }}>
              <RandomMoodButton onClick={handleRandomMood} />
            </div>
          </section>
        ) : (
          // Results View
          <section className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedMood(null)}
                  className="shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <span className="text-3xl">{currentMoodInfo?.emoji}</span>
                    {currentMoodInfo?.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredMovies.length} nəticə tapıldı
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(showFilters && 'bg-primary text-primary-foreground')}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtrlər
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextRecommendation}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Yenilə
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              {showFilters && (
                <aside className="w-full lg:w-72 shrink-0">
                  <FilterPanel
                    filters={filters}
                    onFilterChange={setFilters}
                    onReset={() => setFilters(defaultFilters)}
                  />
                </aside>
              )}

              {/* Movie Grid */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : filteredMovies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredMovies.map((movie, index) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        isFavorite={favorites.includes(movie.id)}
                        isInWatchLater={watchLater.includes(movie.id)}
                        onToggleFavorite={() => toggleFavorite(movie.id)}
                        onToggleWatchLater={() => toggleWatchLater(movie.id)}
                        index={index}
                        comments={comments}
                        reviews={reviews}
                        onAddComment={handleAddComment}
                        onLikeComment={handleLikeComment}
                        onAddReview={handleAddReview}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Sparkles className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Nəticə tapılmadı</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Filtrləri dəyişdirərək daha çox nəticə tapın
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
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

      <AIChatAssistant 
        favorites={favorites}
        watchLater={watchLater}
      />
    </div>
  );
};

export default Index;
