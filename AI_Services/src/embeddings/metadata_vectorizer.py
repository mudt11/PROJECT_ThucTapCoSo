import numpy as np
import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer
import ast

class MetadataVectorizer:
    def __init__(self):
        self.genre_mlb = MultiLabelBinarizer()
        self.artist_mlb = MultiLabelBinarizer()
        self.mood_columns = None

    def build_vectors(self, song_details):
        def parse_list(x):
            if isinstance(x, str) and x.startswith('['):
                return ast.literal_eval(x)
            return [x] if pd.notna(x) else []

        genres = song_details["genres"].apply(parse_list)
        artists = song_details["artist_names"].apply(parse_list)
        moods = song_details["mood"]

        genre_vec = self.genre_mlb.fit_transform(genres)
        artist_vec = self.artist_mlb.fit_transform(artists)
        
        mood_df = pd.get_dummies(moods)
        self.mood_columns = mood_df.columns # Ghi nhớ thứ tự cột mood
        mood_vec = mood_df.values

        # genre_mlb = MultiLabelBinarizer()
        # artist_mlb = MultiLabelBinarizer()

        # genre_vec = genre_mlb.fit_transform(genres)
        # artist_vec = artist_mlb.fit_transform(artists)

        # mood_vec = pd.get_dummies(moods).values

        vectors = np.hstack([
            genre_vec,
            mood_vec,
            artist_vec
        ])

        return vectors
    