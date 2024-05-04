const mongoose = require("mongoose");

const DescribeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    folder: { type: String, required: true },
    describe: { type: Array, required: false },
    bbox: { type: Array, required: false },
    categories_id: { type: Array, required: false },
    categories_name: { type: Array, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Describe", DescribeSchema);
