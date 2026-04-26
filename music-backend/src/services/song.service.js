const {
  User,
  Song,
  Artist,
  SongArtist,
  Album,
  Favorites,
  PlaylistSongs,
  Genre,
  SongGenre,
  sequelize,
} = require("../models");
const { Op, fn, col, where } = require("sequelize");
const cloudinary = require("cloudinary").v2;
const { Sequelize } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

/* --- CHỨC NĂNG CHO USER --- */

// const createSong = async (songData, audioUrl) => {
//   const { title, artist_id, album_id, genre_id, duration } = songData;

//   const newSong = await Song.create({
//     title,
//     artist_id,
//     album_id,
//     genre_id,
//     duration: parseInt(duration) || 0,
//     audio_url: audioUrl,
//     view_count: 0,
//   });

//   return newSong;
// };

// Lấy tất cả bài hát

const normalizeName = (name) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const processManyToMany = async ({
  rawInput,
  Model,
  joinModel,
  foreignKey,
  otherKey,
  transaction,
}) => {
  if (!rawInput) return;

  const list = [
    ...new Set(
      rawInput
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ];

  if (list.length === 0) return;

  const normalizedList = list.map((name) => ({
    original: name,
    normalized: normalizeName(name),
  }));

  // 1. Find existing
  const existing = await Model.findAll({
    where: {
      normalized_name: normalizedList.map((x) => x.normalized),
    },
    transaction,
  });

  const existingMap = new Map(
    existing.map((item) => [item.normalized_name, item]),
  );

  // 2. Create missing
  const toCreate = normalizedList
    .filter((x) => !existingMap.has(x.normalized))
    .map((x) => ({
      name: x.original,
      normalized_name: x.normalized,
    }));

  if (toCreate.length > 0) {
    await Model.bulkCreate(toCreate, {
      transaction,
      ignoreDuplicates: true,
    });
  }

  // 3. Get final (no duplicate, safe)
  const finalRecords = await Model.findAll({
    where: {
      normalized_name: normalizedList.map((x) => x.normalized),
    },
    transaction,
  });

  // 4. Insert join table
  const joinData = finalRecords.map((item) => ({
    [foreignKey]: null, // set later
    [otherKey]: item[`${Model.name.toLowerCase()}_id`],
  }));

  return finalRecords;
};

const createSong = async ({
  title,
  artist,
  genre,
  duration,
  audio_url,
  image_url,
}) => {
  const t = await sequelize.transaction();

  try {
    // 1. Create song
    const newSong = await Song.create(
      {
        title,
        duration: duration || 0,
        audio_url,
        image_url,
        view_count: 0,
        is_visible: true,
      },
      { transaction: t },
    );

    const songId = newSong.song_id;

    // ======================
    // 2. ARTISTS
    // ======================
    if (artist) {
      const list = [
        ...new Set(
          artist
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        ),
      ];

      const normalized = list.map((name) => ({
        original: name,
        normalized: normalizeName(name),
      }));

      const existing = await Artist.findAll({
        where: {
          normalized_name: normalized.map((x) => x.normalized),
        },
        transaction: t,
      });

      const map = new Map(existing.map((a) => [a.normalized_name, a]));

      const toCreate = normalized
        .filter((x) => !map.has(x.normalized))
        .map((x) => ({
          name: x.original,
          normalized_name: x.normalized,
        }));

      if (toCreate.length) {
        await Artist.bulkCreate(toCreate, {
          transaction: t,
          ignoreDuplicates: true,
        });
      }

      const finalArtists = await Artist.findAll({
        where: {
          normalized_name: normalized.map((x) => x.normalized),
        },
        transaction: t,
      });

      await SongArtist.bulkCreate(
        finalArtists.map((a) => ({
          song_id: songId,
          artist_id: a.artist_id,
        })),
        { transaction: t },
      );
    }

    // ======================
    // 3. GENRES
    // ======================
    if (genre) {
      const list = [
        ...new Set(
          genre
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        ),
      ];

      const normalized = list.map((name) => ({
        original: name,
        normalized: normalizeName(name),
      }));

      const existing = await Genre.findAll({
        where: {
          normalized_name: normalized.map((x) => x.normalized),
        },
        transaction: t,
      });

      const map = new Map(existing.map((g) => [g.normalized_name, g]));

      const toCreate = normalized
        .filter((x) => !map.has(x.normalized))
        .map((x) => ({
          name: x.original,
          normalized_name: x.normalized,
        }));

      if (toCreate.length) {
        await Genre.bulkCreate(toCreate, {
          transaction: t,
          ignoreDuplicates: true,
        });
      }

      const finalGenres = await Genre.findAll({
        where: {
          normalized_name: normalized.map((x) => x.normalized),
        },
        transaction: t,
      });

      await SongGenre.bulkCreate(
        finalGenres.map((g) => ({
          song_id: songId,
          genre_id: g.genre_id,
        })),
        { transaction: t },
      );
    }

    await t.commit();

    // 4. Return full data
    return await Song.findByPk(songId, {
      include: [
        {
          model: Artist,
          as: "artists",
          attributes: ["artist_id", "name"],
          through: { attributes: [] },
        },
        {
          model: Genre,
          as: "genres",
          attributes: ["genre_id", "name"],
          through: { attributes: [] },
        },
      ],
    });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const getAllSongs = async ({ page, limit, search }) => {
  const offset = (page - 1) * limit;

  if (search) {
    whereCondition.title = {
      [Op.like]: `%${search}%`,
    };
  }

  const { rows, count } = await Song.findAndCountAll({
    limit,
    offset,
    order: [["song_id", "DESC"]],
    include: [
      {
        model: Artist,
        as: "artists",
        attributes: ["artist_id", "name", "image_url"],
      },
    ],
  });

  return {
    data: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit,
    },
  };
};

// Lấy một bài hát
const getSongById = async (songId) => {
  const song = Song.findByPk(songId, {
    include: [{ model: Artist }, { model: Album }, { model: Genre }],
  });

  if (!song) {
    throw new Error("Không tìm thấy bài hát với ID này!");
  }

  if (song.is_visible === false) {
    throw new Error("Bài hát này hiện không khả dụng.");
  }

  return song;
};

// let cachedSongs = null;
// let cacheExpiredAt = 0;
// async function getSongs({ limit = 20 }) {
//   if (cachedSongs && Date.now() < cacheExpiredAt) {
//     return cachedSongs;
//   }

//   const songs = await Song.findAll({
//     where: {
//       is_visible: true,
//     },
//     order: Sequelize.literal("RAND()"),
//     limit: Number(limit),
//   });

//   cachedSongs = {
//     limit: Number(limit),
//     total: songs.length,
//     songs,
//   };

//   cacheExpiredAt = Date.now() + 1000 * 60 * 30;

//   return cachedSongs;
// }

async function getSongs({ page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  const { rows: songs, count } = await Song.findAndCountAll({
    where: { is_visible: true },
    include: [
      {
        model: Artist,
        as: "artists",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
    order: [["created_at", "DESC"]],
    limit: Number(limit),
    offset,
    distinct: true,
  });

  return {
    page: Number(page),
    limit: Number(limit),
    total: count,
    songs,
  };
}

const incrementSongView = async (songId) => {
  const song = await Song.findByPk(songId);

  if (!song) {
    throw new Error("Song not found");
  }

  await song.increment("view_count", { by: 1 });

  return {
    song_id: song.song_id,
    view_count: song.view_count + 1,
  };
};

/* --- CHỨC NĂNG CHO ADMIN */

const updateSongById = async (songId, updateData) => {
  const { title, artist, genre } = updateData;

  // 1. CHỈ UPDATE KHI SONG ĐÃ TỒN TẠI
  const song = await Song.findByPk(songId);
  if (!song) {
    throw new Error("Bài hát không tồn tại trong hệ thống.");
  }

  let artistId = song.artist_id;

  // 2. Nếu admin đổi tên nghệ sĩ
  if (artist && artist.trim() !== "") {
    const artistName = artist.trim();

    let artistRecord = await Artist.findOne({
      where: { name: artistName },
    });

    // 3. Artist chưa có → tạo mới (CHO PHÉP)
    if (!artistRecord) {
      artistRecord = await Artist.create({
        name: artistName,
        jamendo_id: `manual_${Date.now()}`, // bắt buộc vì schema
        image_url: null,
      });
    }

    artistId = artistRecord.artist_id;
  }

  // 4. UPDATE SONG (KHÔNG TẠO MỚI)
  await song.update({
    title: title ?? song.title,
    genre: genre ?? song.genre,
    artist_id: artistId,
  });

  // 5. Trả về dữ liệu đầy đủ (đúng alias)
  return await Song.findByPk(song.song_id, {
    include: [
      {
        model: Artist,
        as: "artists",
        attributes: ["artist_id", "name", "image_url"],
      },
    ],
  });
};

const deleteSongById = async (songId) => {
  return sequelize.transaction(async (t) => {
    const song = await Song.findOne({
      where: { song_id: songId },
      transaction: t,
    });

    if (!song) {
      throw new Error("Không tìm thấy bài hát.");
    }

    await Favorites.destroy({
      where: { song_id: songId },
      transaction: t,
    });

    await PlaylistSongs.destroy({
      where: { song_id: songId },
      transaction: t,
    });

    await song.destroy({ transaction: t });

    return {
      message: "Xóa bài hát thành công.",
      song_id: songId,
      title: song.title,
    };
  });
};

const toggleSongVisibility = async (songId, adminUser) => {
  const song = await Song.findByPk(songId);
  if (!song) throw new Error("Không tìm thấy bài hát");

  song.is_visible = !song.is_visible;
  await song.save();

  return {
    songId: song.song_id,
    isVisible: song.is_visible,
    message: song.is_visible ? "Bài hát đã được HIỂN thị" : "Bài hát đã bị ẨN",
  };
};

// LIKE SONG
const likeSong = async (userId, songId) => {
  // 1. Kiểm tra bài hát tồn tại
  const song = await Song.findByPk(songId);
  if (!song) {
    throw new Error("Không tìm thấy bài hát.");
  }

  // 2. Kiểm tra đã like chưa
  const existed = await Favorites.findOne({
    where: {
      user_id: userId,
      song_id: songId,
    },
  });

  if (existed) {
    throw new Error("Bạn đã thích bài hát này rồi.");
  }

  // 3. Tạo like
  await Favorites.create({
    user_id: userId,
    song_id: songId,
  });

  return {
    message: "Đã thích bài hát.",
    song_id: songId,
    liked: true,
  };
};

// UNLIKE SONG
const unlikeSong = async (userId, songId) => {
  // 1. Kiểm tra bài hát tồn tại
  const song = await Song.findByPk(songId);
  if (!song) {
    throw new Error("Không tìm thấy bài hát.");
  }

  // 2. Kiểm tra đã like chưa
  const existed = await Favorites.findOne({
    where: {
      user_id: userId,
      song_id: songId,
    },
  });

  if (!existed) {
    throw new Error("Bạn chưa thích bài hát này.");
  }

  // 3. Xóa like
  await Favorites.destroy({
    where: {
      user_id: userId,
      song_id: songId,
    },
  });

  return {
    message: "Đã bỏ thích bài hát.",
    song_id: songId,
    liked: false,
  };
};

const getLikeStatus = async (userId, songId) => {
  // 1. Kiểm tra bài hát tồn tại
  const song = await Song.findByPk(songId);
  if (!song) {
    throw new Error("Không tìm thấy bài hát.");
  }

  // 2. Kiểm tra bảng favorites
  const existed = await Favorites.findOne({
    where: {
      user_id: userId,
      song_id: songId,
    },
  });

  return {
    song_id: songId,
    liked: !!existed,
  };
};

const getLikedSongs = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Song,
        as: "likedSongs",
        through: { attributes: [] },
        where: {
          is_visible: true,
        },
        required: false, // tránh lỗi nếu user chưa like bài nào
        include: [
          {
            model: Artist,
            as: "artists",
            attributes: ["name"],
          },
        ],
      },
    ],
    order: [[{ model: Song, as: "likedSongs" }, "fetched_at", "DESC"]],
  });

  if (!user) {
    throw new Error("Không tìm thấy user");
  }

  return user.likedSongs.map((song) => ({
    trackId: song.song_id,
    jamendoId: Number(song.jamendo_id),
    title: song.title,
    duration: song.duration,
    imageUrl: song.image_url,
    audioUrl: song.audio_url,
    artistName: song.artists?.name || "Unknown",
    albumName: song.album_name || null,
    genre: song.genre,
    viewCount: song.view_count,
    isVisible: song.is_visible,
    fetched_at: song.fetched_at,
  }));
};

const searchSongs = async (keyword, limit) => {
  return Song.findAll({
    where: {
      is_visible: true,
      [Op.or]: [
        { title: { [Op.like]: `%${keyword}%` } },
        { "$artists.name$": { [Op.like]: `%${keyword}%` } },
      ],
    },

    include: [
      {
        model: Artist,
        as: "artists",
        attributes: ["artist_id", "name"],
        through: { attributes: [] },
        required: false,
      },
    ],

    order: [["view_count", "DESC"]],
    limit,
    distinct: true,
    subQuery: false,
  });
};

module.exports = {
  createSong,
  getAllSongs,
  getSongById,
  updateSongById,
  deleteSongById,
  toggleSongVisibility,
  getSongs,
  likeSong,
  unlikeSong,
  getLikeStatus,
  getLikedSongs,
  incrementSongView,
  searchSongs,
};
