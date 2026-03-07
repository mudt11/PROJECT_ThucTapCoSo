import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "data")
MODEL_PATH = os.path.join(BASE_DIR, "models")

# Đảm bảo các thư mục tồn tại
os.makedirs(DATA_PATH, exist_ok=True)
os.makedirs(MODEL_PATH, exist_ok=True)

TRAIN_DATA_CSV = os.path.join(DATA_PATH, "final_training_data.csv")
SONG_METADATA_CSV = os.path.join(DATA_PATH, "song_metadata.csv")

# DB Config 
MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "music_db"
}

MONGO_URI = "mongodb://localhost:27017/"