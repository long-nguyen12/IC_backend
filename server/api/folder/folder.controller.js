const fs = require("fs");
const path = require("path");

exports.getFolder = async (req, res) => {
  try {
    // Get the list of files and directories in the given directory
    const items = fs.readdirSync("uploads", { withFileTypes: true });

    // Filter out only directories
    const folders = items
      .filter((item) => item.isDirectory())
      .map((item) => item.name);
    if (folders.length > 0) {
      res.status(201).json({ data: folders });
    } else {
      res.status(201).send("Chưa có dữ liệu nào được đẩy lên");
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
