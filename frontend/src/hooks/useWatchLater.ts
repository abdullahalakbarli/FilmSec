import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiCall from '@/lib/api';

export function useWatchLater() {
  const { user } = useAuth();
  const [watchLater, setWatchLater] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load watch later from API when user is logged in
  useEffect(() => {
    if (user) {
      loadWatchLater();
    } else {
      setWatchLater([]);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadWatchLater = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const response = await apiCall<string[]>('/watch-later');
    
    if (response.data) {
      setWatchLater(response.data);
    } else {
      // If 403/401 error, token might be invalid - just set empty array
      setWatchLater([]);
    }
    
    setIsLoading(false);
  };

  const addWatchLater = async (movieId: string) => {
    if (!user) {
      return { error: 'Please log in to add to watch later' };
    }

    const response = await apiCall<string[]>('/watch-later/' + movieId, {
      method: 'POST',
    });

    if (response.error) {
      return { error: response.error };
    }

    if (response.data) {
      setWatchLater(response.data);
    }

    return {};
  };

  const removeWatchLater = async (movieId: string) => {
    if (!user) {
      return { error: 'Please log in to manage watch later' };
    }

    const response = await apiCall<string[]>('/watch-later/' + movieId, {
      method: 'DELETE',
    });

    if (response.error) {
      return { error: response.error };
    }

    if (response.data) {
      setWatchLater(response.data);
    }

    return {};
  };

  const toggleWatchLater = async (movieId: string) => {
    if (watchLater.includes(movieId)) {
      return await removeWatchLater(movieId);
    } else {
      return await addWatchLater(movieId);
    }
  };

  return {
    watchLater,
    isLoading,
    addWatchLater,
    removeWatchLater,
    toggleWatchLater,
    refreshWatchLater: loadWatchLater,
  };
}

