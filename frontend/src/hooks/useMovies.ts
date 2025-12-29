import { useState, useEffect } from 'react';
import apiCall from '@/lib/api';
import { Movie, Mood } from '@/types/movie';

export function useMovies(filters?: {
  mood?: Mood | null;
  type?: 'movie' | 'series' | 'all';
  language?: string;
}) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.mood, filters?.type, filters?.language]);

  const loadMovies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.mood) {
        params.append('mood', filters.mood);
      }
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters?.language && filters.language !== 'any') {
        params.append('language', filters.language);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/movies?${queryString}` : '/movies';

      const response = await apiCall<Movie[]>(endpoint);

      if (response.data) {
        setMovies(response.data);
      } else {
        setMovies([]);
        if (response.error) {
          setError(response.error);
        }
      }
    } catch (err) {
      console.error('Error loading movies:', err);
      setMovies([]);
      setError('Failed to load movies');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    movies,
    isLoading,
    error,
    refreshMovies: loadMovies,
  };
}
