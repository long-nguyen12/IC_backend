const mongoose = require("mongoose");

const DescribeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    describe: { type: Array, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Describe", DescribeSchema);
