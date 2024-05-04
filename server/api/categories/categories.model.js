const mongoose = require("mongoose");

const CategoriesSchema = new mongoose.Schema(
  {
    categories_id: { type: String, required: false },
    categories_name: { type: String, required: false },
    supercategory: { type: String, required: false },
    folder: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Categories", CategoriesSchema);
