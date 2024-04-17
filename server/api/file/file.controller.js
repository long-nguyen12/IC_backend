const File = require("./file.model");
const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");
const unrar = require("unrar");
const { createExtractorFromFile } = require("node-unrar-js");

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  const filePath = req.file.path;
  const fileName = path.basename(filePath, path.extname(filePath));
  try {
    let imagePaths = [];

    if (fileExtension === ".zip") {
      imagePaths = await extractImagesFromZip(filePath, fileName);
    } else if (fileExtension === ".rar") {
      await extractImagesFromRar(filePath, fileName);
    } else {
      return res
        .status(400)
        .send("Unsupported file format. Please upload a zip or rar file.");
    }
    const newFile = new File({
      name: req.file.originalname,
      path: req.file.path,
    });

    const Success = await newFile.save();
    res.status(201).send("File uploaded successfully.");
  } catch (err) {
    res.status(400).json({ message: `ERROR: ${err.message}` });
  }
};

async function extractImagesFromZip(filePath, folderName) {
  const imagePaths = [];
  const extractPath = path.join("uploads", folderName);
  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath);
  }
  console.warn(extractPath);
  console.warn(filePath);
  await fs
    .createReadStream(filePath)
    .pipe(unzipper.Parse())
    .on("entry", async (entry) => {
      const fileName = entry.path;
      const imageExtension = path.extname(fileName).toLowerCase();
      if (
        imageExtension === ".jpg" ||
        imageExtension === ".jpeg" ||
        imageExtension === ".png"
      ) {
        const imagePath = path.join(extractPath, path.basename(fileName));
        await entry.pipe(fs.createWriteStream(imagePath));
        imagePaths.push(imagePath);
      } else {
        entry.autodrain();
      }
    })
    .promise();
  return imagePaths;
}

async function extractImagesFromRar(filePath, folderName) {
  const imagePaths = [];
  const extractPath = path.join("uploads", folderName);

  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath);
  }
  try {
    // Create the extractor with the file information (returns a promise)
    const extractor = await createExtractorFromFile({
      filepath: filePath,
      targetPath: extractPath,
    });

    // Extract the files
    [...extractor.extract().files];
  } catch (err) {
    // May throw UnrarError, see docs
    console.error(err);
  }
  // return imagePaths;
  // await unrar.list(filePath, (err, entries) => {
  //   if (err) throw err;
  //   entries.forEach(async (entry) => {
  //     const imageExtension = path.extname(entry.name).toLowerCase();
  //     if (
  //       imageExtension === ".jpg" ||
  //       imageExtension === ".jpeg" ||
  //       imageExtension === ".png"
  //     ) {
  //       const imagePath = path.join(extractPath, path.basename(entry.name));
  //       await unrar
  //         .stream(filePath, entry.name)
  //         .pipe(fs.createWriteStream(imagePath));
  //       imagePaths.push(imagePath);
  //     }
  //   });
  // });
  // return imagePaths;
}
