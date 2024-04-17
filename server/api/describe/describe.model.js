const mongoose = require("mongoose");

const DescribeSchema = new mongoose.Schema(
  {
    name: String,
    describe: Array,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Describe", DescribeSchema);
