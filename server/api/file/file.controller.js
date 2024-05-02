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
      const extractor = await createExtractorFromFile(filePath)
      const list = extractor.getFileList();
      console.log(list);
    } else {
      return res
        .status(400)
        .send("Unsupported file format. Please upload a zip or rar file.");
    }
    const savePromises = [];
      console.log(imagePaths);
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
  const listFolder = [];
  const extractPath = path.join("uploads", folderName);

  // Check if the extractPath folder exists, if not, create it
  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true });
  }

  try {
    // Create extractor instance from RAR file
    const extractor = await createExtractorFromFile({
      filepath: filePath,
      targetPath: extractPath,
    });

    // Get list of files in the RAR archive
    const list = extractor.getFileList();
    // Extracted files information
    // const listArcHeader = list.arcHeader; // archive header
    // const fileHeaders = [...list.fileHeaders]; // list of file headers

    // Extract files from the RAR archive
    const extractedFiles = [...extractor.extract().files];
    // Iterate through extracted files
    for (const file of extractedFiles) {
      // Get the base name of the file (excluding directories)
      const fileName = path.basename(file.fileHeader.name);
      if (file.fileHeader.name.includes("/")) {
        if (!listFolder.includes(file.fileHeader.name.split("/")[0])) {
          listFolder.push(file.fileHeader.name.split("/")[0]);
        }
        imagePaths.push(file.fileHeader.name);
      }else{
        imagePaths.push(fileName); 
      }
    }
  } catch (err) {
    console.error(err); 
  }
  return imagePaths;
}
