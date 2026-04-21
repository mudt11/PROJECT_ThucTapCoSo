const mongoose = require("mongoose");
require("dotenv").config();

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(">>> MONGODB CONNECTED SUCCESSFULLY! <<<");
  } catch (error) {
    console.error(">>> MONGODB CONNECTION ERROR:", error);
    process.exit(1);
  }
};

//  option
mongoose.connection.on("disconnected", () => {
  console.log(">>> MONGODB DISCONNECTED <<<");
});

mongoose.connection.on("error", (err) => {
  console.error(">>> MONGODB CONNECTION ERROR:", err);
});

module.exports = connectMongoDB;
