import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiCall from '@/lib/api';
import { Discussion, DiscussionReply, Mood } from '@/types/movie';

export function useDiscussions(moodFilter?: Mood | 'all') {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load discussions from API
  useEffect(() => {
    loadDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moodFilter]);

  const loadDiscussions = async () => {
    setIsLoading(true);
    const query = moodFilter && moodFilter !== 'all' ? `?mood=${moodFilter}` : '';
    const response = await apiCall<Discussion[]>(`/discussions${query}`);
    
    if (response.data) {
      setDiscussions(response.data);
    } else {
      setDiscussions([]);
    }
    
    setIsLoading(false);
  };

  const createDiscussion = async (mood: Mood, title: string, description: string) => {
    if (!user) {
      return { error: 'Please log in to create discussions' };
    }

    const response = await apiCall<Discussion>('/discussions', {
      method: 'POST',
      body: JSON.stringify({ mood, title, description }),
    });

    if (response.error) {
      return { error: response.error };
    }

    if (response.data) {
      setDiscussions((prev) => [response.data!, ...prev]);
    }

    return {};
  };

  const addReply = async (discussionId: string, content: string) => {
    if (!user) {
      return { error: 'Please log in to add replies' };
    }

    // Validate content
    const trimmedContent = content?.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
      return { error: 'Content cannot be empty' };
    }

    const requestBody = { content: trimmedContent };
    console.log('Sending reply:', { discussionId, content: trimmedContent, requestBody });

    const response = await apiCall<DiscussionReply>(`/discussions/${discussionId}/replies`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (response.error) {
      return { error: response.error };
    }

    if (response.data) {
      // Reload discussions to get updated reply
      await loadDiscussions();
      return {};
    }

    return { error: 'Failed to add reply' };
  };

  const likeReply = async (discussionId: string, replyId: string) => {
    if (!user) {
      return { error: 'Please log in to like replies' };
    }

    const discussion = discussions.find(d => d.id === discussionId);
    if (!discussion) return { error: 'Discussion not found' };

    const reply = discussion.replies.find(r => r.id === replyId);
    if (!reply) return { error: 'Reply not found' };

    const newLikes = (reply.likes || 0) + 1;

    const response = await apiCall<DiscussionReply>(`/discussions/${discussionId}/replies/${replyId}`, {
      method: 'PATCH',
      body: JSON.stringify({ likes: newLikes }),
    });

    if (response.error) {
      return { error: response.error };
    }

    // Reload discussions to get updated reply
    await loadDiscussions();

    return {};
  };

  const deleteDiscussion = async (discussionId: string) => {
    if (!user) {
      return { error: 'Please log in to delete discussions' };
    }

    const response = await apiCall(`/discussions/${discussionId}`, {
      method: 'DELETE',
    });

    if (response.error) {
      return { error: response.error };
    }

    setDiscussions((prev) => prev.filter((d) => d.id !== discussionId));
    return {};
  };

  return {
    discussions,
    isLoading,
    createDiscussion,
    addReply,
    likeReply,
    deleteDiscussion,
    refreshDiscussions: loadDiscussions,
  };
}

