import { supabase } from '../config/supabase';
import { movies } from '../data/movies';
import { moods } from '../data/moods';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@filmmood.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';

async function seedDatabase() {
  console.log('Starting database seeding...');

  console.log('Seeding moods...');
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
    console.error('Error seeding moods:', moodsError);
    return;
  }
  console.log('Moods seeded successfully');

  console.log('Seeding movies...');
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
    console.error('Error seeding movies:', moviesError);
    return;
  }
  console.log('Movies seeded successfully');

  if (!ADMIN_PASSWORD) {
    console.log('Skipping admin user seed (set ADMIN_PASSWORD in .env to create an admin account).');
  } else {
    console.log('Seeding admin user...');
    const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const { error: adminError } = await supabase
      .from('users')
      .upsert(
        {
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          password: hashedAdminPassword,
          role: 'admin',
        },
        { onConflict: 'email' }
      );

    if (adminError) {
      console.error('Error seeding admin user:', adminError);
    } else {
      console.log('Admin user seeded successfully');
      console.log('   Email:', ADMIN_EMAIL);
    }
  }

  console.log('Database seeding completed!');
}

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
