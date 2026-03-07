import pandas as pd
import numpy as np

class DataProcessor:
    def calculate_smart_rating(self, row):
        # Lấy điểm hành động cao nhất (Max Quality)
        q_max = row['action_score_max']
        # Lấy điểm thưởng tần suất
        bonus = row['freq_bonus']
        
        # Rào chắn Logic: Chỉ cộng thưởng nếu đã từng nghe > 20s (điểm >= 3)
        if q_max >= 3:
            final_rating = q_max + bonus
        else:
            final_rating = q_max
            
        return min(5, final_rating)
    
    def process_mongo_data(self, df_mongo_implicit):
        # 1. Gán điểm cho từng hành động đơn lẻ (S_quality)
        def map_base_score(row):
            if row['action'] == 'complete':
                return 4
            if row['action'] == 'play':
                return 3 if row['is_view'] else 2
            if row['action'] == 'skip':
                return 1
            return 0
        
        # Tạo cột điểm tạm thời cho từng bản ghi
        df_mongo_implicit['temp_score'] = df_mongo_implicit.apply(map_base_score, axis=1)
        
        # 2. Nhóm theo (user_id, song_id) để lấy:
        # - action_score_max: Điểm cao nhất họ từng đạt được
        # - play_count: Tổng số lần tương tác để tính bonus
        aggregated = df_mongo_implicit.groupby(['user_id', 'song_id']).agg(
            action_score_max=('temp_score', 'max'),
            play_count=('temp_score', 'count')
        ).reset_index()

        def get_freq_bonus(count):
            if count > 5: return 2
            if count >= 3: return 1
            return 0
        
        aggregated['freq_bonus'] = aggregated['play_count'].apply(get_freq_bonus)

        # aggregated lúc này đã có đủ cột 'action_score_max' và 'freq_bonus'
        aggregated['rating'] = aggregated.apply(self.calculate_smart_rating, axis=1)

        return aggregated[['user_id', 'song_id', 'rating']]

    def merge_with_mysql(self, df_mongo_final, df_mysql_rating, df_favorite):
        combined = pd.concat([df_mongo_final, df_mysql_rating, df_favorite])

        final_df = combined.groupby(['user_id', 'song_id'])['rating'].max().reset_index()

        return final_df