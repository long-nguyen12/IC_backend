const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: String,
  folder: String,
  path: String,
  detection_name: String,
  describe: { type: String, default: null },
  caption: mongoose.Schema.Types.Mixed,
  bbox: { type: Array, default: [], required: false },
  haveCaption: { type: Boolean, default: false },
  Id_folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", required: true },
});

module.exports = mongoose.model("File", FileSchema);
