import { supabase } from '../config/supabase';
import { User, Comment, UserReview, Discussion, DiscussionReply, Movie, MoodInfo, Mood } from '../types';

// Moods
export const getMoods = async (): Promise<MoodInfo[]> => {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching moods:', error);
    return [];
  }
  return (data || []).map(m => ({
    id: m.id as Mood,
    name: m.name,
    emoji: m.emoji,
    description: m.description,
  }));
};

export const getMoodById = async (id: string): Promise<MoodInfo | null> => {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching mood by id:', error);
    return null;
  }
  return {
    id: data.id as Mood,
    name: data.name,
    emoji: data.emoji,
    description: data.description,
  };
};

// Movies
export const getMovies = async (): Promise<Movie[]> => {
  // Supabase default limit is 1000, we need to use range to get all movies
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('title')
    .range(0, 99999); // Get up to 100k movies

  if (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
  return (data || []).map(m => ({
    id: m.id,
    title: m.title,
    posterUrl: m.poster_url,
    rating: parseFloat(m.rating),
    year: m.year,
    duration: m.duration,
    genres: m.genres || [],
    mood: m.mood as Mood,
    type: m.type as 'movie' | 'series',
    language: m.language,
    trailerUrl: m.trailer_url || undefined,
  }));
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching movie by id:', error);
    return null;
  }
  return {
    id: data.id,
    title: data.title,
    posterUrl: data.poster_url,
    rating: parseFloat(data.rating),
    year: data.year,
    duration: data.duration,
    genres: data.genres || [],
    mood: data.mood as Mood,
    type: data.type as 'movie' | 'series',
    language: data.language,
    trailerUrl: data.trailer_url || undefined,
  };
};

export const getMoviesByMood = async (mood: Mood): Promise<Movie[]> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('mood', mood)
    .order('title')
    .range(0, 99999); // Get all movies for this mood

  if (error) {
    console.error('Error fetching movies by mood:', error);
    return [];
  }
  return (data || []).map(m => ({
    id: m.id,
    title: m.title,
    posterUrl: m.poster_url,
    rating: parseFloat(m.rating),
    year: m.year,
    duration: m.duration,
    genres: m.genres || [],
    mood: m.mood as Mood,
    type: m.type as 'movie' | 'series',
    language: m.language,
    trailerUrl: m.trailer_url || undefined,
  }));
};

export const getMoviesWithFilters = async (
  filters: {
    mood?: Mood;
    type?: 'movie' | 'series' | 'all';
    language?: string;
  },
  page: number = 1,
  limit: number = 50
): Promise<{ movies: Movie[]; total: number; page: number; totalPages: number }> => {
  let query = supabase.from('movies').select('*', { count: 'exact' });

  if (filters.mood) {
    query = query.eq('mood', filters.mood);
  }

  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }

  if (filters.language && filters.language !== 'any') {
    query = query.eq('language', filters.language);
  }

  // Calculate pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('title').range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching movies with filters:', error);
    return { movies: [], total: 0, page, totalPages: 0 };
  }

  const movies = (data || []).map(m => ({
    id: m.id,
    title: m.title,
    posterUrl: m.poster_url,
    rating: parseFloat(m.rating),
    year: m.year,
    duration: m.duration,
    genres: m.genres || [],
    mood: m.mood as Mood,
    type: m.type as 'movie' | 'series',
    language: m.language,
    trailerUrl: m.trailer_url || undefined,
  }));

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return { movies, total, page, totalPages };
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data || [];
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    console.error('Error fetching user by email:', error);
    return null;
  }
  return data;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching user by id:', error);
    return null;
  }
  return data;
};

export const addUser = async (user: Omit<User, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id: user.id || undefined,
      email: user.email,
      name: user.name,
      password: user.password,
      avatar: user.avatar || null,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding user:', error);
    return null;
  }
  return data;
};

// Comments
export const getComments = async (): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return (data || []).map(c => ({
    id: c.id,
    movieId: c.movie_id,
    username: c.username,
    content: c.content,
    createdAt: c.created_at,
    likes: c.likes || 0,
  }));
};

export const getCommentsByMovieId = async (movieId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('movie_id', movieId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments by movie id:', error);
    return [];
  }
  return (data || []).map(c => ({
    id: c.id,
    movieId: c.movie_id,
    username: c.username,
    content: c.content,
    createdAt: c.created_at,
    likes: c.likes || 0,
  }));
};

export const addComment = async (comment: Omit<Comment, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      id: comment.id || undefined,
      movie_id: comment.movieId,
      username: comment.username,
      content: comment.content,
      likes: comment.likes || 0,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    return null;
  }
  return {
    id: data.id,
    movieId: data.movie_id,
    username: data.username,
    content: data.content,
    createdAt: data.created_at,
    likes: data.likes || 0,
  };
};

export const updateComment = async (commentId: string, updates: Partial<Comment>): Promise<boolean> => {
  const updateData: any = {};
  if (updates.likes !== undefined) updateData.likes = updates.likes;
  if (updates.content !== undefined) updateData.content = updates.content;

  const { error } = await supabase
    .from('comments')
    .update(updateData)
    .eq('id', commentId);

  if (error) {
    console.error('Error updating comment:', error);
    return false;
  }
  return true;
};

export const deleteComment = async (commentId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
  return true;
};

// Reviews
export const getReviews = async (): Promise<UserReview[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return (data || []).map(r => ({
    id: r.id,
    movieId: r.movie_id,
    username: r.username,
    rating: r.rating,
    review: r.review,
    createdAt: r.created_at,
  }));
};

export const getReviewsByMovieId = async (movieId: string): Promise<UserReview[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('movie_id', movieId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews by movie id:', error);
    return [];
  }
  return (data || []).map(r => ({
    id: r.id,
    movieId: r.movie_id,
    username: r.username,
    rating: r.rating,
    review: r.review,
    createdAt: r.created_at,
  }));
};

export const addReview = async (review: Omit<UserReview, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<UserReview | null> => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      id: review.id || undefined,
      movie_id: review.movieId,
      username: review.username,
      rating: review.rating,
      review: review.review,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding review:', error);
    return null;
  }
  return {
    id: data.id,
    movieId: data.movie_id,
    username: data.username,
    rating: data.rating,
    review: data.review,
    createdAt: data.created_at,
  };
};

export const updateReview = async (reviewId: string, updates: Partial<UserReview>): Promise<boolean> => {
  const updateData: any = {};
  if (updates.rating !== undefined) updateData.rating = updates.rating;
  if (updates.review !== undefined) updateData.review = updates.review;

  const { error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', reviewId);

  if (error) {
    console.error('Error updating review:', error);
    return false;
  }
  return true;
};

export const deleteReview = async (reviewId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error('Error deleting review:', error);
    return false;
  }
  return true;
};

// Discussions
export const getDiscussions = async (): Promise<Discussion[]> => {
  const { data, error } = await supabase
    .from('discussions')
    .select(`
      *,
      discussion_replies (
        id,
        username,
        content,
        likes,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching discussions:', error);
    return [];
  }
  return (data || []).map(d => ({
    id: d.id,
    mood: d.mood,
    title: d.title,
    description: d.description,
    username: d.username,
    createdAt: d.created_at,
    replies: (d.discussion_replies || []).map((r: any) => ({
      id: r.id,
      username: r.username,
      content: r.content,
      createdAt: r.created_at,
      likes: r.likes || 0,
    })),
  }));
};

export const getDiscussionById = async (id: string): Promise<Discussion | null> => {
  const { data, error } = await supabase
    .from('discussions')
    .select(`
      *,
      discussion_replies (
        id,
        username,
        content,
        likes,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching discussion by id:', error);
    return null;
  }
  return {
    id: data.id,
    mood: data.mood,
    title: data.title,
    description: data.description,
    username: data.username,
    createdAt: data.created_at,
    replies: (data.discussion_replies || []).map((r: any) => ({
      id: r.id,
      username: r.username,
      content: r.content,
      createdAt: r.created_at,
      likes: r.likes || 0,
    })),
  };
};

export const addDiscussion = async (discussion: Omit<Discussion, 'id' | 'createdAt' | 'replies'> & { id?: string; createdAt?: string }): Promise<Discussion | null> => {
  const { data, error } = await supabase
    .from('discussions')
    .insert([{
      id: discussion.id || undefined,
      mood: discussion.mood,
      title: discussion.title,
      description: discussion.description,
      username: discussion.username,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding discussion:', error);
    return null;
  }
  return {
    id: data.id,
    mood: data.mood,
    title: data.title,
    description: data.description,
    username: data.username,
    createdAt: data.created_at,
    replies: [],
  };
};

export const updateDiscussion = async (discussionId: string, updates: Partial<Discussion>): Promise<boolean> => {
  const updateData: any = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.mood !== undefined) updateData.mood = updates.mood;

  const { error } = await supabase
    .from('discussions')
    .update(updateData)
    .eq('id', discussionId);

  if (error) {
    console.error('Error updating discussion:', error);
    return false;
  }
  return true;
};

export const deleteDiscussion = async (discussionId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('discussions')
    .delete()
    .eq('id', discussionId);

  if (error) {
    console.error('Error deleting discussion:', error);
    return false;
  }
  return true;
};

// Discussion Replies
export const addDiscussionReply = async (discussionId: string, reply: Omit<DiscussionReply, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<DiscussionReply | null> => {
  const { data, error } = await supabase
    .from('discussion_replies')
    .insert([{
      id: reply.id || undefined,
      discussion_id: discussionId,
      username: reply.username,
      content: reply.content,
      likes: reply.likes || 0,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding discussion reply:', error);
    return null;
  }
  return {
    id: data.id,
    username: data.username,
    content: data.content,
    createdAt: data.created_at,
    likes: data.likes || 0,
  };
};

export const updateDiscussionReply = async (replyId: string, updates: Partial<DiscussionReply>): Promise<boolean> => {
  const updateData: any = {};
  if (updates.likes !== undefined) updateData.likes = updates.likes;
  if (updates.content !== undefined) updateData.content = updates.content;

  const { error } = await supabase
    .from('discussion_replies')
    .update(updateData)
    .eq('id', replyId);

  if (error) {
    console.error('Error updating discussion reply:', error);
    return false;
  }
  return true;
};

// Favorites
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('favorites')
    .select('movie_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
  return (data || []).map(f => f.movie_id);
};

export const addFavorite = async (userId: string, movieId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('favorites')
    .insert([{
      user_id: userId,
      movie_id: movieId,
    }]);

  if (error) {
    // Ignore duplicate key errors (already favorited)
    if (error.code !== '23505') {
      console.error('Error adding favorite:', error);
      return false;
    }
  }
  return true;
};

export const removeFavorite = async (userId: string, movieId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('movie_id', movieId);

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
  return true;
};

// Watch Later
export const getUserWatchLater = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('watch_later')
    .select('movie_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user watch later:', error);
    return [];
  }
  return (data || []).map(w => w.movie_id);
};

export const addWatchLater = async (userId: string, movieId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('watch_later')
    .insert([{
      user_id: userId,
      movie_id: movieId,
    }]);

  if (error) {
    // Ignore duplicate key errors (already in watch later)
    if (error.code !== '23505') {
      console.error('Error adding watch later:', error);
      return false;
    }
  }
  return true;
};

export const removeWatchLater = async (userId: string, movieId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('watch_later')
    .delete()
    .eq('user_id', userId)
    .eq('movie_id', movieId);

  if (error) {
    console.error('Error removing watch later:', error);
    return false;
  }
  return true;
};
