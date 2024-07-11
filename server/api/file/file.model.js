const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: String,
  folder: String,
  path: String,
  detection_name: String,
  haveCaption: { type: Boolean, default: false },
});

module.exports = mongoose.model("File", FileSchema);
