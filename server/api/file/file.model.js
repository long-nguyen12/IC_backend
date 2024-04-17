const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: String,
  path: String,
});

module.exports = mongoose.model("File", FileSchema);
