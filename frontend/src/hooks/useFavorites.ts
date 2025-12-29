import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiCall from '@/lib/api';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from API when user is logged in
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const response = await apiCall<string[]>('/favorites');
    
    if (response.data) {
      setFavorites(response.data);
    } else {
      // If 403/401 error, token might be invalid - just set empty array
      setFavorites([]);
    }
    
    setIsLoading(false);
  };

  const addFavorite = async (movieId: string) => {
    if (!user) {
      return { error: 'Please log in to add favorites' };
    }

    const response = await apiCall<string[]>('/favorites/' + movieId, {
      method: 'POST',
    });

    if (response.error) {
      return { error: response.error };
    }

    if (response.data) {
      setFavorites(response.data);
    }

    return {};
  };

  const removeFavorite = async (movieId: string) => {
    if (!user) {
      return { error: 'Please log in to manage favorites' };
    }

    const response = await apiCall<string[]>('/favorites/' + movieId, {
      method: 'DELETE',
    });

    if (response.error) {
      return { error: response.error };
    }

    if (response.data) {
      setFavorites(response.data);
    }

    return {};
  };

  const toggleFavorite = async (movieId: string) => {
    if (favorites.includes(movieId)) {
      return await removeFavorite(movieId);
    } else {
      return await addFavorite(movieId);
    }
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refreshFavorites: loadFavorites,
  };
}

