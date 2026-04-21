const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Favorite = sequelize.define(
  "Favorite",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },

    song_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "favorites",
    timestamps: true, // Bật lên để dùng tính năng ngày tháng
    createdAt: "created_at", // Map đúng tên cột trong database
  },
);

module.exports = Favorite;
