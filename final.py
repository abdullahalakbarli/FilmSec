import requests
import pandas as pd
import time

BASE_URL = "https://api.themoviedb.org/3"
LANGUAGE = "en-US"

TOTAL_ITEMS = 10000        # movie + series toplam
PER_PAGE = 20
TOTAL_PAGES = TOTAL_ITEMS // PER_PAGE

OUTPUT_FILE = "movies.csv"

HEADERS = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0N2RhYWViODVlMjkyODZlZjA5YmZlOTdjZGZlMzIzMCIsIm5iZiI6MTc2Njk1NjE4Ni4yNjQsInN1YiI6IjY5NTE5YzlhOWRkZGU0ZDkzNTg4ZGRiZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.f3fmLZMEwWs3AJamdqsmf6S3CHgARHmMkmN_XK5s8ak",
    "Accept": "application/json"
}

# ===== GENRE & MOOD =====
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

def get_mood_from_genres(genre_list):
    for g in genre_list:
        if g in GENRE_MOOD_MAP:
            return GENRE_MOOD_MAP[g]
    return "thoughtful"

def get_movie_details(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}"
    r = requests.get(url, headers=HEADERS)
    if r.status_code != 200:
        return None, None
    data = r.json()
    runtime = data.get("runtime")
    trailer = get_trailer("movie", movie_id)
    return runtime, trailer

def get_series_details(tv_id):
    url = f"{BASE_URL}/tv/{tv_id}"
    r = requests.get(url, headers=HEADERS)
    if r.status_code != 200:
        return None, None
    data = r.json()
    runtime = data["episode_run_time"][0] if data.get("episode_run_time") else None
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

items = []
current_id = 19

def fetch_content(content_type):
    global current_id
    total_pages = TOTAL_PAGES // 2
    for page in range(1, total_pages + 1):
        print(f"📄 Fetching {content_type.upper()} page {page}/{total_pages} …")
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
                year = item.get("release_date", "2000")[:4]
            else:
                runtime, trailer = get_series_details(item["id"])
                title = item.get("name")
                year = item.get("first_air_date", "2000")[:4]

            if not runtime:
                runtime = 90

            genres_names = [GENRE_MAP.get(gid, "Unknown") for gid in item.get("genre_ids", [])]

            items.append({
                "id": current_id,
                "title": title,
                "poster_url": f"https://image.tmdb.org/t/p/w500{item['poster_path']}",
                "rating": round(item.get("vote_average", 0), 1),
                "year": int(year),
                "duration": f"{runtime} min",
                "genres": ", ".join(genres_names),
                "mood": get_mood_from_genres(genres_names),
                "type": "movie" if content_type == "movie" else "series",
                "language": item.get("original_language", "en"),
                "trailer_url": trailer
            })
            current_id += 1
            time.sleep(0.1)  # rate limit safety

print("🎬 Fetching MOVIES…")
fetch_content("movie")
print("📺 Fetching SERIES…")
fetch_content("tv")

# ===== SAVE CSV =====
df = pd.DataFrame(items)
df.to_csv(OUTPUT_FILE, index=False)
print(f"\n✅ DONE: {len(df)} items saved → {OUTPUT_FILE}")
