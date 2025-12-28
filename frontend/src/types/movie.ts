export type Mood = 'happy' | 'sad' | 'excited' | 'relax' | 'thoughtful' | 'romantic';

export interface MoodInfo {
  id: Mood;
  name: string;
  emoji: string;
  description: string;
}

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  rating: number;
  year: number;
  duration: string;
  genres: string[];
  trailerUrl?: string;
  mood: Mood;
  type: 'movie' | 'series';
  language: string;
}

export interface Filters {
  type: 'movie' | 'series' | 'all';
  duration: '30-60' | '60-120' | 'any';
  language: 'EN' | 'TR' | 'KR' | 'any';
}

// Community types
export interface Comment {
  id: string;
  movieId: string;
  username: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface UserReview {
  id: string;
  movieId: string;
  username: string;
  rating: number;
  review: string;
  createdAt: string;
}

export interface Discussion {
  id: string;
  mood: Mood;
  title: string;
  description: string;
  username: string;
  createdAt: string;
  replies: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  username: string;
  content: string;
  createdAt: string;
  likes: number;
}
