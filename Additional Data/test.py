from supabase import create_client, Client

# ===== Supabase Config =====
SUPABASE_URL = "https://wjpothompgvqthbihxsh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcG90aG9tcGd2cXRoYmloeHNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkzNTkxNywiZXhwIjoyMDgyNTExOTE3fQ.KJS2Kl0BS0DSnpapw_v0MPbxuKp0NVC42RK0LJ_i_Kg"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ===== Test Row =====
test_row = {
    "id": "test_1",
    "title": "Test Movie",
    "poster_url": "https://via.placeholder.com/500",
    "rating": 8.5,
    "year": 2023,
    "duration": "120 min",
    "genres": ["Action", "Comedy"],
    "mood": "excited",
    "type": "movie",
    "language": "en",
    "trailer_url": "https://youtube.com"
}

# ===== Insert =====
try:
    res = supabase.table("movies").insert([test_row]).execute()  # list format
    if res.data:
        print("✅ Test row inserted successfully!")
    else:
        print("❌ Failed to insert test row")
        print(res)
except Exception as e:
    print("❌ Exception occurred:", e)
