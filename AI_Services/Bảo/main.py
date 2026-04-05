from fastapi import FastAPI
import tensorflow as tf
import pickle
import numpy as np
import pandas as pd

app = FastAPI(title="Music Recommendation API")

# 1. Load mô hình và các file ánh xạ khi khởi động API
with open('models/user_to_index.pkl', 'rb') as f:
    user_to_index = pickle.load(f)

with open("models/item_to_index.pkl", "rb") as f:
    item_to_index = pickle.load(f)

# Đảo ngược từ điển để map từ Index về ID thật
index_to_item = {v: k for k, v in item_to_index.items()}

model = tf.keras.models.load_model('models/ncf_model.keras')

# Mock dữ liệu train_data để biết user đã nghe gì (sẽ cung cấp từ DB sau)
# Tạm thời dùng file lastfm_clean.csv từ Giai đoạn 1
train_data = pd.read_csv("models/lastfm_clean.csv")

@app.get("/recommend/{user_id}")
async def recommend(user_id: int, type: str = "discover"):
    """
    type='discover': Gợi ý bài mới chưa nghe
    type='re-listen': Gợi ý bài đã nghe dựa trên sở thích
    """
    if user_id not in user_to_index.values():
        return {"message": "User mới, trả về danh sách Trending"}
    
    u_idx = [k for k, v in user_to_index.items() if v == user_id][0]
    all_item_indices = np.arange(len(item_to_index))
    user_array = np.full(len(item_to_index), u_idx)

    # Dự đoán
    predictions = model.predict([user_array, all_item_indices], batch_size=512, verbose=0).flatten()

    # Lấy danh sách bài đã nghe
    heard_items = train_data[train_data['userID'] == user_id]['item_index'].values

    if type == "discover":
        # Hạ điểm các bài đã nghe xuống cực thấp để lọc ra bài mới
        predictions[heard_items] = -999
    else:
        # Chỉ giữ lại điểm các bài đã nghe, các bài khác cho về -999
        mask = np.ones(len(predictions), dtype=bool)
        mask[heard_items] = False
        predictions[mask] = -999

    # Lấy Top 10
    top_indices = predictions.argsort()[-10:][::-1]

    # Chuyển Index về ID thật của Artist/Song
    recommendations = []
    for idx in top_indices:
        if predictions[idx] > -100: # Loại bỏ các bài đã bị lọc
            recommendations.append({
                "artistID": int(index_to_item[idx]),
                "score": float(np.clip(predictions[idx], 1.0, 5.0))
            })
            
    return {"user_id": user_id, "type": type, "recommendations": recommendations}