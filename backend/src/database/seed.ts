import { supabase } from '../config/supabase';
import { movies } from '../data/movies';
import { moods } from '../data/moods';
import bcrypt from 'bcryptjs';

// CTF ADMIN USER CONFIGURATION:
// Admin credentials for the CTF challenge:
// Email: admin@filmsec.com
// Password: AdminSecure2024!
// Role: admin
// 
// Note: This admin user can be accessed via SQL injection vulnerability
// in the login endpoint, or by logging in with the above credentials.
const ADMIN_USER = {
  email: 'admin@filmsec.com',
  password: 'AdminSecure2024!',
  name: 'System Administrator',
  role: 'admin',
};

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

  // CTF: Seed admin user
  console.log('👤 Seeding admin user...');
  const hashedAdminPassword = await bcrypt.hash(ADMIN_USER.password, 10);
  
  const { error: adminError } = await supabase
    .from('users')
    .upsert(
      {
        email: ADMIN_USER.email,
        name: ADMIN_USER.name,
        password: hashedAdminPassword,
        role: ADMIN_USER.role,
      },
      { onConflict: 'email' }
    );

  if (adminError) {
    console.error('❌ Error seeding admin user:', adminError);
  } else {
    console.log('✅ Admin user seeded successfully');
    console.log('   Email:', ADMIN_USER.email);
    console.log('   Password:', ADMIN_USER.password);
    console.log('   Role:', ADMIN_USER.role);
  }

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

