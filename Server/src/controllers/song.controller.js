const songService = require("../services/song.service");
const cloudinary = require("cloudinary").v2;
const fs = require("fs-extra");
const { Song, User } = require("../models");
const UserActivity = require("../models/mongo/UserActivity");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* --- CONTROLLER FOR USER --- */

// const createSong = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       throw new Error("Bạn phải upload một file nhạc!");
//     }

//     const songData = req.body;
//     const tempFilePath = req.file.path;

//     const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
//       folder: "music-app/songs",
//       resource_type: "video",
//     });

//     const audioUrl = uploadResult.secure_url;

//     await fs.unlink(tempFilePath);

//     const newSong = await songService.createSong(songData, audioUrl);

//     res.status(201).json({ message: "Upload THÀNH CÔNG!", data: newSong });
//   } catch (error) {
//     console.error("LỖI BÊN TRONG SONG CONTROLLER:", error);
//     next(error);
//   }
// };

const createSong = async (req, res, next) => {
  try {
    const { title, artist, genre, duration } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Thiếu title" });
    }

    const audioFile = req.files?.audioFile?.[0];
    const imageFile = req.files?.imageFile?.[0];

    if (!audioFile) {
      return res.status(400).json({ message: "Thiếu file audio" });
    }

    // upload audio
    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      folder: "music/audio",
      resource_type: "video",
    });

    // upload image (optional)
    let imageUrl = null;
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "music/image",
      });
      imageUrl = imageUpload.secure_url;
    }

    // xóa file local
    await fs.unlink(audioFile.path);
    if (imageFile) await fs.unlink(imageFile.path);

    const newSong = await songService.createSong({
      title,
      artist,
      genre,
      duration,
      audio_url: audioUpload.secure_url,
      image_url: imageUrl,
    });

    res.status(201).json({
      message: "Upload thành công",
      data: newSong,
    });
  } catch (err) {
    next(err);
  }
};

const getAllSongs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await songService.getAllSongs({
      page,
      limit,
      search,
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bài hát thành công.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getSongById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const song = await songService.getSongById(id);
    res.status(200).json({
      message: "Lấy bài hát thành công!",
      data: song,
    });
  } catch (error) {
    next(error);
  }
};

async function getSongList(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await songService.getSongs({ page, limit });

    res.json(result);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const increaseView = async (req, res) => {
  try {
    const { songId } = req.params;
    const userId = req.user.userId;

    const result = await songService.incrementSongView(songId);

    // Lưu lịch sử hành vi vào UserActivity
    const activity = new UserActivity({
      user_id: userId,
      song_id: parseInt(songId, 10),
      action: "play",
      duration_listened: 0,
      completion_rate: 0,
      is_view: false,
    });
    await activity.save();

    return res.status(200).json({
      success: true,
      message: "View increased",
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/* --- CONTROLLER FOR ADMIN */

const updateSongById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedSong = await songService.updateSongById(id, updateData);

    res.status(200).json({
      message: "Admin cập nhật thành công.",
      data: updatedSong,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSongById = async (req, res, next) => {
  try {
    const rawId = req.params.id;

    // 1. Kiểm tra tồn tại param
    if (!rawId) {
      return res.status(400).json({
        message: "Thiếu ID bài hát.",
      });
    }

    // 2. Ép kiểu + validate
    const songId = parseInt(rawId, 10);

    if (!Number.isInteger(songId) || songId <= 0) {
      return res.status(400).json({
        message: "ID bài hát không hợp lệ.",
      });
    }

    // 3. Gọi service
    const result = await songService.deleteSongById(songId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const toggleSongVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await songService.toggleSongVisibility(id);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const searchSongs = async (req, res) => {
  try {
    const { q = "", limit = 10 } = req.query;

    if (!q.trim()) {
      return res.json({ data: [] });
    }

    const songs = await songService.searchSongs(q, Number(limit));
    res.json({ data: songs });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};

module.exports = {
  createSong,
  getAllSongs,
  getSongById,
  updateSongById,
  deleteSongById,
  toggleSongVisibility,
  getSongList,
  // likeSong,
  // unlikeSong,
  // getLikeStatus,
  // getLikedSongs,
  increaseView,
  // logSongActivity,
  searchSongs,
};
