export interface PlaylistSong {
  song_id: number;
  title: string;
  image_url?: string;
  audio_url: string;
  duration: number;
}

export interface Playlist {
  playlist_id: number;
  user_id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;

  songs?: PlaylistSong[];
}


