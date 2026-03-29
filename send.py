import csv
import os
from supabase import create_client, Client
from typing import List

# Supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://wjpothompgvqthbihxsh.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcG90aG9tcGd2cXRoYmloeHNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkzNTkxNywiZXhwIjoyMDgyNTExOTE3fQ.KJS2Kl0BS0DSnpapw_v0MPbxuKp0NVC42RK0LJ_i_Kg')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def parse_genres(genres_str: str) -> List[str]:
    """Parse comma-separated genres string to list"""
    if not genres_str or genres_str.strip() == '':
        return []
    # Split by comma and strip whitespace
    genres = [genre.strip() for genre in genres_str.split(',')]
    # Remove 'Unknown' if present
    genres = [g for g in genres if g.lower() != 'unknown']
    return genres

def convert_movie_row(row: dict) -> dict:
    """Convert CSV row to Supabase movie format"""
    # Parse genres from comma-separated string to array
    genres = parse_genres(row.get('genres', ''))
    
    # Convert id to string
    movie_id = str(row.get('id', ''))
    
    # Convert rating to float
    rating = float(row.get('rating', 0))
    
    # Convert year to int
    year = int(row.get('year', 0))
    
    # Handle empty trailer_url
    trailer_url = row.get('trailer_url', '').strip()
    if not trailer_url:
        trailer_url = None
    
    return {
        'id': movie_id,
        'title': row.get('title', '').strip(),
        'poster_url': row.get('poster_url', '').strip(),
        'rating': rating,
        'year': year,
        'duration': row.get('duration', '').strip(),
        'genres': genres,  # Array format for PostgreSQL
        'mood': row.get('mood', '').strip(),
        'type': row.get('type', 'movie').strip(),
        'language': row.get('language', 'en').strip(),
        'trailer_url': trailer_url
    }

def import_movies_from_csv(csv_file_path: str, batch_size: int = 100):
    """Import movies from CSV file to Supabase"""
    movies = []
    imported = 0
    failed = 0
    
    print(f"Reading CSV file: {csv_file_path}")
    
    with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row_num, row in enumerate(reader, start=2):  # Start at 2 because row 1 is header
            try:
                movie = convert_movie_row(row)
                movies.append(movie)
                
                # Insert in batches
                if len(movies) >= batch_size:
                    result = supabase.table('movies').insert(movies).execute()
                    imported += len(movies)
                    print(f"Imported {imported} movies...")
                    movies = []
                    
            except Exception as e:
                print(f"Error processing row {row_num}: {e}")
                print(f"Row data: {row}")
                failed += 1
                continue
        
        # Insert remaining movies
        if movies:
            try:
                result = supabase.table('movies').insert(movies).execute()
                imported += len(movies)
                print(f"Imported remaining {len(movies)} movies...")
            except Exception as e:
                print(f"Error inserting final batch: {e}")
                failed += len(movies)
    
    print(f"\n✅ Import completed!")
    print(f"   Successfully imported: {imported} movies")
    print(f"   Failed: {failed} movies")

if __name__ == '__main__':
    # Path to CSV file
    csv_file_path = 'movies.csv'
    
    # Check if file exists
    if not os.path.exists(csv_file_path):
        print(f"❌ Error: CSV file '{csv_file_path}' not found!")
        print("Please make sure the CSV file is in the same directory as this script.")
        exit(1)
    
    print("🚀 Starting movie import to Supabase...")
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"CSV file: {csv_file_path}\n")
    
    # Import movies
    import_movies_from_csv(csv_file_path, batch_size=100)
