import { useState, useEffect } from 'react';
import apiCall from '@/lib/api';
import { Movie, Mood } from '@/types/movie';

interface MoviesResponse {
  movies: Movie[];
  total: number;
  page: number;
  totalPages: number;
}

export function useMovies(
  filters?: {
    mood?: Mood | null;
    type?: 'movie' | 'series' | 'all';
    language?: string;
  },
  page: number = 1
) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMovies(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.mood, filters?.type, filters?.language, currentPage]);

  const loadMovies = async (pageNum: number) => {
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
      params.append('page', pageNum.toString());
      params.append('limit', '50'); // 50 movies per page

      const endpoint = `/movies?${params.toString()}`;

      const response = await apiCall<MoviesResponse>(endpoint);

      if (response.data) {
        setMovies(response.data.movies);
        setTotal(response.data.total);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.totalPages);
      } else {
        setMovies([]);
        setTotal(0);
        setTotalPages(0);
        if (response.error) {
          setError(response.error);
        }
      }
    } catch (err) {
      console.error('Error loading movies:', err);
      setMovies([]);
      setTotal(0);
      setTotalPages(0);
      setError('Failed to load movies');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  return {
    movies,
    total,
    currentPage,
    totalPages,
    isLoading,
    error,
    goToPage,
    refreshMovies: () => loadMovies(currentPage),
  };
}
