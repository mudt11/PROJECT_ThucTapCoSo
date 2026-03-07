import json
import os
import pickle  
import numpy as np
from fastapi import FastAPI
import uvicorn
from src.recommender import Recommender
from src.candidate_generation.collaborative_filter import CFModel
from src.candidate_generation.vector_candidate import VectorCandidate
from src.candidate_generation.popularity_candidate import PopularityCandidate
from src.config.settings import MODEL_PATH

app = FastAPI(title="Music Recommendation AI Service")

def load_models():
    # Load CF
    with open(os.path.join(MODEL_PATH, "user_similarity.pkl"), "rb") as f:
        user_sim, user_item = pickle.load(f)
    cf_model = CFModel()
    cf_model.user_similarity = user_sim
    cf_model.user_item_matrix = user_item

    # Load Vector Content
    song_vectors = np.load(os.path.join(MODEL_PATH, "song_vectors.npy"))

    with open(os.path.join(MODEL_PATH, "song_id_map.json"), "r") as f:
        song_id_map = json.load(f)

    song_id_map = {int(k): int(v) for k, v in song_id_map.items()}
    vector_gen = VectorCandidate(song_vectors, song_id_map)

    # Load Popularity
    with open(os.path.join(MODEL_PATH, "popularity.json"), "r") as f:
        pop_dict = json.load(f)
    pop_dict = {int(k): v for k, v in pop_dict.items()}
    popularity_gen = PopularityCandidate(pop_dict)

    return Recommender(cf_model, vector_gen, popularity_gen)

recommender = load_models()

@app.get("/recommend/{user_id}")
async def get_recommendation(user_id: int):
    liked_songs = get_user_liked_songs(user_id)

    recommendations = recommender.recommend(
        user_id,
        liked_songs=liked_songs
    )
    
    return {
        "status": "success",
        "user_id": user_id,
        "data": recommendations
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)