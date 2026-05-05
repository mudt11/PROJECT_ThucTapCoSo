import { Track } from "@/app/types/music";

export class PlayerService {
  private playlist: Track[] = [];
  private currentIndex: number = 0;

  setPlaylist(list: Track[], startIndex: number) {
    this.playlist = list;
    this.currentIndex = startIndex;
  }

  getCurrentTrack(): Track | null {
    return this.playlist[this.currentIndex] || null;
  }

  next(): Track | null {
    if (!this.playlist.length) return null;

    // nếu chưa hết → next bình thường
    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex++;
      return this.getCurrentTrack();
    }

    // nếu hết → KHÔNG loop
    return null;
  }

  prev(): Track | null {
    if (!this.playlist.length) return null;
    this.currentIndex =
      (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    return this.getCurrentTrack();
  }

  getIndex() {
    return this.currentIndex;
  }

  getPlaylist() {
    return this.playlist;
  }

  appendTracks(tracks: Track[]) {
    const existingIds = new Set(this.playlist.map((t) => t.trackId));

    const unique = tracks.filter((t) => !existingIds.has(t.trackId));

    this.playlist = [...this.playlist, ...unique];
  }

  remaining() {
    return this.playlist.length - this.currentIndex - 1;
  }
}
