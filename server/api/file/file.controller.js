const File = require("./file.model");
const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");
const unrar = require("unrar");
const { createExtractorFromFile } = require("node-unrar-js");

exports.getFileByFolder = async (req, res) => {
  try {
    const { folder, page = 1, limit = 25, sort } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Calculate the number of documents to skip
    const skip = (pageNumber - 1) * limitNumber;

    // Retrieve documents with pagination
    // const file = await File.find({ folder }).skip(skip).limit(limitNumber);
    const file = await File.find({ folder });
    // const sortFile = file
    //   .sort((b, a) => b.haveCaption + a.haveCaption)
    //   .slice((page - 1) * limit, page * limit);
    let sortFile;

    if (sort === "asc") {
      sortFile = file
        .sort((b, a) => b.haveCaption - a.haveCaption)
        .slice((page - 1) * limit, page * limit);
    } else if (sort === "desc") {
      sortFile = file
        .sort((b, a) => b.haveCaption + a.haveCaption)
        .slice((page - 1) * limit, page * limit);
    } else {
      // Default sorting if no sort parameter is provided
      sortFile = file
        .sort((b, a) => b.haveCaption - a.haveCaption)
        .slice((page - 1) * limit, page * limit);
    }
    if (file.length === 0) {
      return res
        .status(404)
        .json({ message: "Chưa có ảnh nào trong mục này có mô tả!" });
    }

    res.status(200).json({ file: sortFile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFileInfo = async (req, res) => {
  try {
    const { folder, name } = req.query;

    // Retrieve documents with pagination
    const file = await File.findOne({ folder, name });

    // Check if any documents were found
    // if (!file) {
    //   return res
    //     .status(404)
    //     .json({ message: "Chưa có ảnh nào trong mục này có mô tả!" });
    // }
    file.haveCaption = true;
    await file.save();
    res.status(200).message("Thêm mô tả thành công!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
      imagePaths = await extractImagesFromRar(filePath, fileName);
    } else {
      return res
        .status(400)
        .send("Unsupported file format. Please upload a zip or rar file.");
    }
    const savePromises = [];
    imagePaths.map((item) => {
      const newFile = new File({
        name: item,
        folder: fileName,
        path: req.file.path,
      });

      savePromises.push(newFile.save());
    });
    const savedFiles = await Promise.all(savePromises);
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
        imagePaths.push(path.basename(fileName));
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
  console.log(extractPath);
  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true });
  }

  try {
    const extractor = await createExtractorFromFile({
      filepath: filePath,
      targetPath: extractPath,
    });

    // const files = extractor.extract().files;
    const extractedFiles = [...extractor.extract().files];
    for (const file of extractedFiles) {
      // console.log(file.fileHeader.name.match(/\.(jpg|jpeg|png|gif)$/i));
      const fileName = path.basename(file.fileHeader.name);
      imagePaths.push(fileName);
      // if (file.type === "FILE") {
      //   const fileName = path.basename(file.fileHeader.name);
      //   const imageExtension = path.extname(fileName).toLowerCase();
      //   const entryPath = path.join(extractPath, fileName);

      //   if (
      //     imageExtension === ".jpg" ||
      //     imageExtension === ".jpeg" ||
      //     imageExtension === ".png"
      //   ) {
      //     // If it's an image file, extract it to the folder with the RAR file name
      //     await fs.promises.mkdir(extractPath, { recursive: true });
      //     await file.extract(extractPath);
      //     imagePaths.push(entryPath);
      //   }
      // }
    }
  } catch (err) {
    console.error(err);
  }

  return imagePaths;
}
