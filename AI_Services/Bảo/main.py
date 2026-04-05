# Chạy: python -m uvicorn main:app --reload
from fastapi import FastAPI
import tensorflow as tf
import pickle
import numpy as np
import pandas as pd

app = FastAPI(title="Music Recommendation API")

# 1. Load mô hình và các file ánh xạ khi khởi động API
# Đảm bảo các file này nằm trong thư mục models/
with open("models/user_to_index.pkl", "rb") as f:
    user_mapping = pickle.load(f)  # Cấu trúc: {Index: UserID}
    
with open("models/item_to_index.pkl", "rb") as f:
    item_mapping = pickle.load(f)  # Cấu trúc: {Index: ArtistID}

# Đảo ngược từ điển User để tìm Index từ ID nhanh hơn (O(1) thay vì O(n))
user_id_to_idx = {v: k for k, v in user_mapping.items()}

# Load mô hình AI
model = tf.keras.models.load_model('models/ncf_model_v2.keras')

# Load dữ liệu lịch sử để lọc
train_data = pd.read_csv("models/lastfm_clean.csv")

@app.get("/recommend/{user_id}")
async def recommend(user_id: int, type: str = "discover"):
    """
    type='discover': Gợi ý bài mới chưa nghe
    type='re-listen': Gợi ý bài đã nghe dựa trên sở thích
    """
    
    # Kiểm tra user có tồn tại trong hệ thống không
    u_idx = user_id_to_idx.get(user_id)
    
    if u_idx is None:
        return {"message": "User mới hoặc không tồn tại, trả về danh sách Trending", "recommendations": []}
    
    # Chuẩn bị dữ liệu dự đoán cho toàn bộ kho nhạc
    num_items = len(item_mapping)
    all_item_indices = np.arange(num_items)
    user_array = np.full(num_items, u_idx)

    # AI thực hiện dự đoán điểm số
    predictions = model.predict([user_array, all_item_indices], batch_size=512, verbose=0).flatten()

    # Lấy danh sách index các bài user ĐÃ NGHE
    # Lưu ý: Tên cột phải khớp với file csv của bạn (userID và item_index)
    heard_items = train_data[train_data['userID'] == user_id]['item_index'].values

    if type == "discover":
        # KHÁM PHÁ: Ép điểm các bài ĐÃ NGHE xuống cực thấp để lọc ra bài MỚI
        predictions[heard_items] = -999
    else:
        # NGHE LẠI: Chỉ giữ điểm bài ĐÃ NGHE, các bài MỚI cho về -999
        mask = np.ones(len(predictions), dtype=bool)
        mask[heard_items] = False
        predictions[mask] = -999

    # Lấy Top 10 bài có điểm cao nhất sau khi lọc
    top_indices = predictions.argsort()[-10:][::-1]

    recommendations = []
    for idx in top_indices:
        idx_int = int(idx) # Chuyển về int chuẩn Python để tránh lỗi KeyError với numpy types
        
        if predictions[idx_int] > -100: # Chỉ lấy các bài không bị lọc (-999)
            recommendations.append({
                # Lấy ArtistID thật từ item_mapping bằng Index
                "artistID": int(item_mapping[idx_int]), 
                "score": float(np.clip(predictions[idx_int], 1.0, 5.0))
            })
            
    return {
        "user_id": user_id, 
        "type": type, 
        "total_results": len(recommendations),
        "recommendations": recommendations
    }