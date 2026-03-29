import requests
import time
import uuid
from supabase import create_client, Client

# ===== Supabase Config =====
SUPABASE_URL = "https://wjpothompgvqthbihxsh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcG90aG9tcGd2cXRoYmloeHNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkzNTkxNywiZXhwIjoyMDgyNTExOTE3fQ.KJS2Kl0BS0DSnpapw_v0MPbxuKp0NVC42RK0LJ_i_Kg"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ===== TMDB Config =====
BASE_URL = "https://api.themoviedb.org/3"
LANGUAGE = "en-US"
HEADERS = {
    "Authorization": "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2RhYWViODVlMjkyODZlZjA5YmZlOTdjZGZlMzIzMCIsIm5iZiI6MTc2Njk1NjE4Ni4yNjQsInN1YiI6IjY5NTE5YzlhOWRkZGU0ZDkzNTg4ZGRiZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.f3fmLZMEwWs3AJamdqsmf6S3CHgARHmMkmN_XK5s8ak",
    "Accept": "application/json"
}

START_PAGE = 1
END_PAGE = 250

# ===== Genre & Mood Mapping =====
GENRE_MAP = {
    28: "Action", 12: "Adventure", 53: "Thriller", 80: "Crime",
    35: "Comedy", 16: "Animation", 10751: "Family",
    10749: "Romance",
    18: "Drama", 27: "Horror", 10752: "War",
    99: "Documentary", 36: "History", 878: "Sci-Fi",
    14: "Fantasy", 9648: "Mystery",
    10402: "Music", 10770: "TV Movie"
}

GENRE_MOOD_MAP = {
    "Action": "excited", "Adventure": "excited", "Thriller": "excited", "Crime": "excited",
    "Comedy": "happy", "Animation": "happy", "Family": "happy",
    "Romance": "romantic",
    "Drama": "sad", "Horror": "sad", "War": "sad",
    "Documentary": "thoughtful", "History": "thoughtful", "Sci-Fi": "thoughtful",
    "Fantasy": "thoughtful", "Mystery": "thoughtful",
    "Music": "relax", "TV Movie": "relax"
}

def get_mood_from_genres(genres):
    for g in genres:
        if g in GENRE_MOOD_MAP:
            return GENRE_MOOD_MAP[g]
    return "thoughtful"

def get_movie_details(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}"
    r = requests.get(url, headers=HEADERS)
    if r.status_code != 200:
        return None, None
    data = r.json()
    runtime = data.get("runtime") or 90
    trailer = get_trailer("movie", movie_id)
    return runtime, trailer

def get_series_details(tv_id):
    url = f"{BASE_URL}/tv/{tv_id}"
    r = requests.get(url, headers=HEADERS)
    if r.status_code != 200:
        return None, None
    data = r.json()
    runtime = data.get("episode_run_time", [90])[0]
    trailer = get_trailer("tv", tv_id)
    return runtime, trailer

def get_trailer(type_, tmdb_id):
    url = f"{BASE_URL}/{type_}/{tmdb_id}/videos"
    r = requests.get(url, headers=HEADERS)
    if r.status_code != 200:
        return None
    for v in r.json().get("results", []):
        if v["site"] == "YouTube" and v["type"] == "Trailer":
            return f"https://www.youtube.com/watch?v={v['key']}"
    return None

# ===== Insert Helper =====
def insert_batch(batch):
    try:
        res = supabase.table("movies").insert(batch).execute()
        if res.data:
            print(f"✅ Inserted batch of {len(batch)} items")
        else:
            print("❌ Failed batch insert")
    except Exception as e:
        print("❌ Exception during batch insert:", e)

# ===== Main Fetch & Insert =====
current_id = 19
BATCH_SIZE = 50
batch = []

def fetch_content(content_type):
    global current_id, batch
    for page in range(START_PAGE, END_PAGE + 1):
        print(f"📄 Fetching {content_type.upper()} page {page}/{END_PAGE}")
        r = requests.get(
            f"{BASE_URL}/discover/{content_type}",
            headers=HEADERS,
            params={"language": LANGUAGE, "sort_by": "popularity.desc", "page": page, "vote_count.gte": 50}
        )
        results = r.json().get("results", [])
        for item in results:
            if not item.get("poster_path"):
                continue

            if content_type == "movie":
                runtime, trailer = get_movie_details(item["id"])
                title = item.get("title")
                year = int(item.get("release_date","2000")[:4])
                typ = "movie"
            else:
                runtime, trailer = get_series_details(item["id"])
                title = item.get("name")
                year = int(item.get("first_air_date","2000")[:4])
                typ = "series"

            genres_names = [GENRE_MAP.get(gid, "Unknown") for gid in item.get("genre_ids", [])]
            row = {
                "id": str(current_id),
                "title": title,
                "poster_url": f"https://image.tmdb.org/t/p/w500{item['poster_path']}",
                "rating": round(item.get("vote_average", 0),1),
                "year": year,
                "duration": f"{runtime} min",
                "genres": genres_names,
                "mood": get_mood_from_genres(genres_names),
                "type": typ,
                "language": item.get("original_language","en"),
                "trailer_url": trailer
            }
            batch.append(row)
            current_id += 1

            if len(batch) >= BATCH_SIZE:
                insert_batch(batch)
                batch = []

        # small delay to avoid rate limit
        time.sleep(0.2)

# ===== Start =====
print("🎬 Fetching MOVIES…")
fetch_content("movie")
print("📺 Fetching SERIES…")
fetch_content("tv")

# Insert remaining batch
if batch:
    insert_batch(batch)

print("\n🎉 All data inserted successfully into Supabase!")
