const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Song = sequelize.define(
  "Song",
  {
    song_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255), 
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0, 
    },
    audio_url: {
      type: DataTypes.STRING(500),
      allowNull: false, 
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "songs",
    timestamps: true, 
    createdAt: "created_at", 
  }
);

module.exports = Song;