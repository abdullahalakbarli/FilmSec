import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiCall from '@/lib/api';
import { Comment } from '@/types/movie';

export function useComments(movieId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load comments from API
  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const loadComments = async () => {
    setIsLoading(true);
    const response = await apiCall<Comment[]>(`/comments/movie/${movieId}`);
    
    if (response.data) {
      setComments(response.data);
    } else {
      setComments([]);
    }
    
    setIsLoading(false);
  };

  const addComment = async (content: string) => {
    if (!user) {
      return { error: 'Please log in to add comments' };
    }

    const response = await apiCall<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify({ movieId, content }),
    });

    if (response.error) {
      return { error: response.error };
    }

    if (response.data) {
      setComments((prev) => [response.data!, ...prev]);
    }

    return {};
  };

  const likeComment = async (commentId: string) => {
    if (!user) {
      return { error: 'Please log in to like comments' };
    }

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return { error: 'Comment not found' };

    const newLikes = (comment.likes || 0) + 1;

    const response = await apiCall<Comment>(`/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ likes: newLikes }),
    });

    if (response.error) {
      return { error: response.error };
    }

    if (response.data) {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? response.data! : c))
      );
    }

    return {};
  };

  const deleteComment = async (commentId: string) => {
    if (!user) {
      return { error: 'Please log in to delete comments' };
    }

    const response = await apiCall(`/comments/${commentId}`, {
      method: 'DELETE',
    });

    if (response.error) {
      return { error: response.error };
    }

    setComments((prev) => prev.filter((c) => c.id !== commentId));
    return {};
  };

  return {
    comments,
    isLoading,
    addComment,
    likeComment,
    deleteComment,
    refreshComments: loadComments,
  };
}

