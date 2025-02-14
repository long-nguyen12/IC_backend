const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: String,
  folder: String,
  path: String,
  detection_name: String,
  describe: { type: String, default: null },
  caption: mongoose.Schema.Types.Mixed,
  bbox: { type: Array,default: [], required: false },
  haveCaption: { type: Boolean, default: false },
});

module.exports = mongoose.model("File", FileSchema);
