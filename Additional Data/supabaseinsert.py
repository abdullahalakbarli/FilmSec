import pandas as pd
from supabase import create_client, Client

# ===== Supabase Config =====
SUPABASE_URL = "https://wjpothompgvqthbihxsh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcG90aG9tcGd2cXRoYmloeHNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjkzNTkxNywiZXhwIjoyMDgyNTExOTE3fQ.KJS2Kl0BS0DSnpapw_v0MPbxuKp0NVC42RK0LJ_i_Kg"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ===== CSV Fayl oxu =====
df = pd.read_csv("movies3.csv")

# ===== Batch Insert =====
CHUNK_SIZE = 100  # Supabase large insert üçün batch

def insert_movies_batch(df):
    for i in range(0, len(df), CHUNK_SIZE):
        chunk = df.iloc[i:i+CHUNK_SIZE].to_dict(orient="records")
        res = supabase.table("movies").insert(chunk).execute()
        if res.status_code != 201:
            print(f"❌ Error inserting chunk {i} - {i+CHUNK_SIZE}")
        else:
            print(f"✅ Inserted chunk {i} - {i+CHUNK_SIZE}")

insert_movies_batch(df)
print("\n🎉 All movies inserted successfully!")
