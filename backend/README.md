# FilmMood Backend API

Backend API for FilmMood - Mood-based Movie Recommendations application.

## Author

**Abdullah Alakberli**

## Features

- User authentication (JWT-based)
- Movie and mood management
- Comments and reviews system
- Community discussions
- Favorites and watch later lists
- RESTful API design
- **Supabase database integration**

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Supabase** - PostgreSQL database

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
PORT=4243
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
SUPABASE_URL=https://wjpothompgvqthbihxsh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcG90aG9tcGd2cXRoYmloeHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzU5MTcsImV4cCI6MjA4MjUxMTkxN30.YXPib0SB5ARaGHaenh5soHUSkbhP2MEQt_Zdv-8lJjw
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcG90aG9tcGd2cXRoYmloeHNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkzNTkxNywiZXhwIjoyMDgyNTExOTE3fQ.KJS2Kl0BS0DSnpapw_v0MPbxuKp0NVC42RK0LJ_i_Kg
```

3. **Set up Supabase database:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `src/database/schema.sql` to create all necessary tables

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

The server will run on `http://localhost:4243` by default.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Sign in
- `GET /api/auth/me` - Get current user

### Movies
- `GET /api/movies` - Get all movies (with optional filters: mood, type, language)
- `GET /api/movies/:id` - Get movie by ID
- `GET /api/movies/mood/:mood` - Get movies by mood

### Moods
- `GET /api/moods` - Get all moods
- `GET /api/moods/:id` - Get mood by ID

### Comments
- `GET /api/comments/movie/:movieId` - Get comments for a movie
- `POST /api/comments` - Create a comment (requires auth)
- `PATCH /api/comments/:id` - Update a comment (requires auth)
- `DELETE /api/comments/:id` - Delete a comment (requires auth)

### Reviews
- `GET /api/reviews/movie/:movieId` - Get reviews for a movie
- `POST /api/reviews` - Create a review (requires auth)
- `PUT /api/reviews/:id` - Update a review (requires auth)
- `DELETE /api/reviews/:id` - Delete a review (requires auth)

### Discussions
- `GET /api/discussions` - Get all discussions (optional mood filter)
- `GET /api/discussions/:id` - Get discussion by ID
- `POST /api/discussions` - Create a discussion (requires auth)
- `POST /api/discussions/:id/replies` - Add reply to discussion (requires auth)
- `PATCH /api/discussions/:id/replies/:replyId` - Update reply (requires auth)
- `DELETE /api/discussions/:id` - Delete a discussion (requires auth)

### Favorites
- `GET /api/favorites` - Get user favorites (requires auth)
- `POST /api/favorites/:movieId` - Add to favorites (requires auth)
- `DELETE /api/favorites/:movieId` - Remove from favorites (requires auth)

### Watch Later
- `GET /api/watch-later` - Get user watch later list (requires auth)
- `POST /api/watch-later/:movieId` - Add to watch later (requires auth)
- `DELETE /api/watch-later/:movieId` - Remove from watch later (requires auth)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Database

The backend uses **Supabase** (PostgreSQL) for data storage. Make sure to:

1. Run the SQL schema from `src/database/schema.sql` in your Supabase SQL Editor
2. Configure the Supabase credentials in your `.env` file

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files (Supabase client)
│   ├── data/           # Static data (movies, moods)
│   ├── database/       # Database operations and schema
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── types/          # TypeScript types
│   └── server.ts       # Main server file
└── package.json
```

## License

This project is private and proprietary.
