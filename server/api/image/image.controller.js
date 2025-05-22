const fs = require("fs");
const path = require("path");
const multer = require('multer');

let mime = {
  html: "text/html",
  txt: "text/plain",
  css: "text/css",
  gif: "image/gif",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  js: "application/javascript",
};

exports.getAllImageName = async (req, res) => {
  try {
    const folderName = req.query.folder; // Get the folder name from the query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // Check if the folder name is provided
    if (!folderName) {
      return res
        .status(400)
        .json({ error: "Folder name parameter is required" });
    }

    const folderPath = path.join("uploads", folderName);
    // Check if the folder exists
    fs.access(folderPath, fs.constants.F_OK, (err) => {
      if (err) {
        return res
          .status(404)
          .json({ error: "Folder not found", path: folderPath });
      }

      // Read the contents of the directory
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          return res.status(500).json({ error: "Internal server error" });
        }

        // Filter out only file names (excluding directories)
        const fileNames = files.filter((file) => {
          const filePath = path.join(folderPath, file);
          return fs.statSync(filePath).isFile();
        });

        // Calculate pagination offsets
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Get the subset of files for the current page
        const paginatedFiles = fileNames.slice(startIndex, endIndex);

        res.json({ files: paginatedFiles });
      });
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// exports.test = async (req, res) => {
//   try {
//     res.status(200).send("test");
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

exports.viewImage = async (req, res) => {
  try {
    const file = await getImagePath(
      req.query.name,
      path.join("uploads", req.query.folder)
    );
    const type = mime[path.extname(file).slice(1)] || "text/plain";
    const s = fs.createReadStream(file);
    s.on("open", function () {
      res.set("Content-Type", type);
      s.pipe(res);
    });
    s.on("error", function () {
      res.set("Content-Type", "text/plain");
      res.status(404).end("Not found");
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};




exports.upload = async (req,res)=>{
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.status(200).json({ file: `http://localhost:7000/${req.file.filename}` });
};




const getImagePath = async (fileName = "", filesDir = "") => {
  if (!fileName) return null;
  return path.join(filesDir, fileName);
};

exports.downloadJson = async (req, res) => {
  // res.json({ folder: req.query.folder, name: req.query.name });
  const file = await getJsonPath(`${req.query.name}_${req.query.subMenu}.json`);
  const type = mime[path.extname(file).slice(1)] || "text/plain";
  const s = fs.createReadStream(file);
  s.on("open", function () {
    res.set("Content-Type", type);
    s.pipe(res);
  });
  s.on("error", function () {
    res.set("Content-Type", "text/plain");
    res.status(404).end("Not found");
  });
};

const getJsonPath = async (fileName = "", filesDir = "output") => {
  if (!fileName) return null;
  return path.join(filesDir, fileName);
};
