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
import { Mood, Filters, Movie, UserReview } from '@/types/movie';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { useWatchLater } from '@/hooks/useWatchLater';
import { useMovies } from '@/hooks/useMovies';
import { toast } from '@/hooks/use-toast';

const defaultFilters: Filters = {
  type: 'all',
  duration: 'any',
  language: 'any',
};

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const { watchLater, toggleWatchLater } = useWatchLater();
  const [showFavorites, setShowFavorites] = useState(false);
  const [showWatchLater, setShowWatchLater] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [reviews, setReviews] = useState<UserReview[]>([]);

  // Fetch movies from API based on selected mood and filters
  const { movies: filteredMovies, isLoading: moviesLoading, refreshMovies } = useMovies(
    selectedMood
      ? {
          mood: selectedMood,
          type: filters.type,
          language: filters.language,
        }
      : undefined
  );

  // Fetch all movies for favorites and watch later lists (only when drawers are open)
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  useEffect(() => {
    if (showFavorites || showWatchLater) {
      // Fetch all movies when drawers are opened
      const fetchAllMovies = async () => {
        const response = await apiCall<Movie[]>('/movies');
        if (response.data) {
          setAllMovies(response.data);
        }
      };
      fetchAllMovies();
    }
  }, [showFavorites, showWatchLater]);

  // Load reviews from localStorage (can be migrated to API later)
  useEffect(() => {
    const savedReviews = localStorage.getItem('reviews');
    if (savedReviews) setReviews(JSON.parse(savedReviews));
  }, []);

  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  const favoriteMovies = useMemo(() => {
    return allMovies.filter((movie) => favorites.includes(movie.id));
  }, [favorites, allMovies]);

  const watchLaterMovies = useMemo(() => {
    return allMovies.filter((movie) => watchLater.includes(movie.id));
  }, [watchLater, allMovies]);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleRandomMood = () => {
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    handleMoodSelect(randomMood.id);
  };

  const handleMovieSelectFromAI = (movie: Movie) => {
    // Set the mood to match the movie's mood
    handleMoodSelect(movie.mood);
    
    // Scroll to top of page first to ensure movies section is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Scroll to movies section after a delay to allow state update and render
    setTimeout(() => {
      const moviesSection = document.getElementById('movies-section');
      if (moviesSection) {
        // Calculate offset for header
        const headerOffset = 80;
        const elementPosition = moviesSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        // If section not found, scroll to top and wait a bit more
        setTimeout(() => {
          const moviesSection = document.getElementById('movies-section');
          if (moviesSection) {
            const headerOffset = 80;
            const elementPosition = moviesSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 300);
      }
    }, 200);
  };

  const handleNextRecommendation = () => {
    // Refresh movies with current filters
    refreshMovies();
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
                  <div id="movies-section" className="flex-1">
                    {moviesLoading ? (
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
                        onToggleFavorite={() => handleToggleFavorite(movie.id)}
                        onToggleWatchLater={() => handleToggleWatchLater(movie.id)}
                        index={index}
                        reviews={reviews}
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
        onRemoveFavorite={handleToggleFavorite}
      />

      <WatchLaterDrawer
        isOpen={showWatchLater}
        onClose={() => setShowWatchLater(false)}
        watchLater={watchLaterMovies}
        onRemoveFromWatchLater={handleToggleWatchLater}
      />

      <AIChatAssistant 
        favorites={favorites}
        watchLater={watchLater}
        onMovieSelect={handleMovieSelectFromAI}
      />
    </div>
  );
};

export default Index;
