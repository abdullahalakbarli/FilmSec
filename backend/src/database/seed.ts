import { supabase } from '../config/supabase';
import { movies } from '../data/movies';
import { moods } from '../data/moods';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  // Seed moods
  console.log('📝 Seeding moods...');
  const { error: moodsError } = await supabase
    .from('moods')
    .upsert(
      moods.map(mood => ({
        id: mood.id,
        name: mood.name,
        emoji: mood.emoji,
        description: mood.description,
      })),
      { onConflict: 'id' }
    );

  if (moodsError) {
    console.error('❌ Error seeding moods:', moodsError);
    return;
  }
  console.log('✅ Moods seeded successfully');

  // Seed movies
  console.log('📝 Seeding movies...');
  const { error: moviesError } = await supabase
    .from('movies')
    .upsert(
      movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        poster_url: movie.posterUrl,
        rating: movie.rating,
        year: movie.year,
        duration: movie.duration,
        genres: movie.genres,
        mood: movie.mood,
        type: movie.type,
        language: movie.language,
        trailer_url: movie.trailerUrl || null,
      })),
      { onConflict: 'id' }
    );

  if (moviesError) {
    console.error('❌ Error seeding movies:', moviesError);
    return;
  }
  console.log('✅ Movies seeded successfully');

  console.log('🎉 Database seeding completed!');
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding process failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;

