const File = require("./file.model");
const lolder = require("../folder/folder.model");
const Describe = require("../describe/describe.model");
const Categories = require("../categories/categories.model");
const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");
const unrar = require("unrar");
const { createExtractorFromFile } = require("node-unrar-js");
const AdmZip = require("adm-zip");
const HistoryController = require("../history/history.controller");
const axios = require("axios");
const FormData = require("form-data");
const sharp = require("sharp");
const Folder = require("../folder/folder.model");

const FS = require("fs").promises;

const formatToWindowsPath = (filePath) => {
  return filePath.replace(/\//g, "\\");
};

exports.deleteFile = async (req, res) => {
  try {
    console.log("req", req.params.id);
    const file = await File.findById(req.params.id);

    if (!file) { return res.status(404).json({ error: "File not found" }) }
    await file.deleteOne();
    res.status(200).json({ message: "Xóa file thành công!" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.getFoderAll = async (req, res) => {
  try {
    const { folder, name } = req.query;
    const file = await File.find();
    file.haveCaption = true;
    await file.save();
    res.status(200).message("Thêm mô tả thành công!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.SendAI = async (req, res) => {
  try {

    const fileName = req.body.dectect_path;

    const filePath = path.join(__dirname, "..", "..", "..", fileName.replace(/\\/g, "/"));

    if (!fs.existsSync(filePath)) {

      return res.status(404).json({ error: `File not found: ${filePath} ` });

    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    await axios
      .post("https://icai.ailabs.io.vn/v1/api/detection", formData, {
        headers: {
          ...formData.getHeaders(),
        },
      })
      .then(async (response) => {
        console.log("response.data", response.data)
        const linkBoximg = `https://icai.ailabs.io.vn/v1/api/images/` + response.data.dectect_path.split("/").pop()
        const fileAI = await File.findOneAndUpdate(
          { _id: req.body.id },
          { $set: { describe: linkBoximg } },
          { returnDocument: "after" }
        );
        res.status(200).json(fileAI);
      })
      .catch((error) => {
        console.error(`Lỗi upload: ${filePath}`, error.message);
        res.status(500).json({ error: error.message });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFileByFolder = async (req, res) => {
  try {
    const { folder, page = 1, limit = 25, sort, includes } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const skip = (pageNumber - 1) * limitNumber;

    // const file = await File.find({ folder }).skip(skip).limit(limitNumber);
    let nameRegex;

    if (includes !== "all") {
      nameRegex = new RegExp("^" + includes + "/.*\\.(jpg|png|jpeg)$", "i");
    } else {
      nameRegex = /\.(jpg|png|jpeg)$/i;
    }
    const file = await File.find({
      folder,
      name: { $regex: nameRegex },
    });
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
      sortFile = file
        .sort((b, a) => b.haveCaption - a.haveCaption)
        .slice((page - 1) * limit, page * limit);
    }

    res.status(200).json({ file: sortFile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFileId = async (req, res) => {
  try {
    // const { folder, name , Describe } = req.query;

    const file = await File.findById(req.query.id);
    // file.haveCaption = true;
    // file.Describe = Describe;

    res.status(200).json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateFileInfo = async (req, res) => {
  try {
    // const { folder, name , Describe } = req.query;
    const file = await File.findById(req.body.id);
    // file.haveCaption = true;
    // file.Describe = Describe;
    file.caption = JSON.parse(req.body.caption);
    file.markModified("data");
    await file.save("file", file);
    res.status(200).json({ success: true, file: file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  const filePath = path.normalize(req.file.path);
  const fileName = path.basename(filePath, path.extname(filePath));

  try {
    const folder = await File.find({ folder: fileName + "ss" });
    console.log("filePath", filePath)
    // if (folder.length === 0) {
    let imagePaths = [];

    if (fileExtension === ".zip") {
      imagePaths = await unzipDirectory(filePath, fileName);
      const folderRecord = new Folder({
        folder: fileName,
        name: fileName,
        path: filePath,
      });
      const savedFolder = await folderRecord.save();
      const savePromises = imagePaths.map((item) => {
        const result = path.dirname(item);
        const newFile = new File({
          name: item,
          folder: fileName,
          path: path.normalize(result),
          Id_folder: savedFolder._id,
        });
        return newFile
          .save()
          .then(() =>
            HistoryController.createHistory(
              req.user.userId,
              req.user.email,
              `Thêm mới file ${result}`,
              item
            )
          )
          .catch((error) =>
            console.error(`Error saving file ${item}:`, error)
          );
      });

      await Promise.all(savePromises);
    } else if (fileExtension === ".rar") {
      console.log("firlrear")
      imagePaths = await unrarDirectory(filePath, fileName);
      const folderRecord = new Folder({
        folder: fileName,
        name: fileName,
        path: filePath,
      });
      const savedFolder = await folderRecord.save();
      const savePromises = imagePaths.map((item) => {

        const result = item;
      
        const newFile = new File({
          name: item,
          folder: fileName,
          path: path.normalize(result),
          Id_folder: savedFolder._id,
        });
        return newFile
          .save()
          .then(() =>
            HistoryController.createHistory(
              req.user.userId,
              req.user.email,
              `Thêm mới file ${result}`,
              item
            )
          )
          .catch((error) =>
            console.error(`Error saving file ${item}:`, error)
          );
      });

      await Promise.all(savePromises);


    } else {
      return res
        .status(400)
        .send("Unsupported file format. Please upload a zip or rar file.");
    }


    res.status(201).send("File uploaded successfully.");

  } catch (err) {
    res.status(400).json({ message: `ERROR: ${err.message}` });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const folderName = req.params.folderName;
    console.log("folderNamedelete", folderName);
    await File.deleteMany({ folder: folderName });
    const folderPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      folderName
    );

    await Folder.deleteMany({ name: folderName });


    // if (!fs.existsSync(folderPath)) {
    //   return res.status(404).json({ error: "Thư mục không tồn tạissss" });
    // }

    fs.rmSync(folderPath, { recursive: true, force: true });

    return res.status(200).json({ message: "Thư mục đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa thư mục:", error.message);
    return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
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
      const type = entry.type;
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

async function unzipDirectory(inputFilePath, outputDirectory) {
  const imagePaths = [];
  const folderPaths = [];
  const extractPath = path.join("uploads", outputDirectory);

  const zip = new AdmZip(inputFilePath);
  const zipEntries = zip.getEntries();

  zipEntries.forEach((zipEntry) => {
    const fileName = zipEntry.entryName.split("/");
    const imageExtension = path.extname(zipEntry.entryName).toLowerCase();

    if (!folderPaths.includes(fileName[0])) {
      folderPaths.push(fileName[0]);
    }

    if ([".jpg", ".jpeg", ".png", ".json"].includes(imageExtension)) {
      const relativePath = path.join(
        "uploads",
        outputDirectory,
        zipEntry.entryName
      );
      imagePaths.push(relativePath);
    }
  });

  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true });
  }

  await new Promise((resolve, reject) => {
    zip.extractAllToAsync(extractPath, true, (error) => {
      if (error) {

        reject(error);
      } else {
        console.log(`Extracted to "${outputDirectory}" successfully`);
        processImagesInFolder(extractPath);
        resolve();
      }
    });
  });

  return imagePaths;
}

async function unrarDirectory(inputFilePath, outputDirectory) {
  const imagePaths = [];
  const folderPaths = [];
  const extractPath = path.join("uploads", outputDirectory);

  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true });
  }

  try {
    const extractor = await createExtractorFromFile({
      filepath: inputFilePath,
      targetPath: extractPath,
    });

    const extracted = await extractor.extract();

    for (const file of extracted.files) {
      const entryName = file.fileHeader.name;
      const parts = entryName.split("/");
      const ext = path.extname(entryName).toLowerCase();

      if ([".jpg", ".jpeg", ".png", ".json"].includes(ext)) {
        const relativePath = path.join("uploads", outputDirectory, entryName);
        imagePaths.push(relativePath);
      }
    }

    return imagePaths;
  } catch (err) {
    console.error("RAR extract error:", err);
    throw new Error(`Failed to extract RAR file: ${err.message}`);
  }
}



async function getAllImages(dir) {
  let images = [];
  const files = await fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.statSync(fullPath);
    if (stat.isDirectory()) {
      images = images.concat(await getAllImages(fullPath));
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
      images.push(fullPath);
    }
  }
  return images;
}



/**
 * Resize image while preserving directory structure
 */
async function resizeImage(imagePath) {
  try {
    const outputPath = imagePath + ".tmp"; // Temporary file

    await sharp(imagePath)
      .resize(1024, 768, { fit: "inside" })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    await fs.renameSync(outputPath, imagePath);
    return outputPath;
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error);
    throw error;
  }
}




async function processImagesInFolder(folderPath) {
  try {
    const images = await getAllImages(folderPath);

    if (images.length === 0) {
      console.log("No images found for compression.");
      return;
    }

    await Promise.all(images.map((image) => resizeImage(image)));
  } catch (e) {
    console.log(e);
  }
}

// eleteAllData()

async function eleteAllData() {
  try {
    await File.deleteMany({ folder: "aa" });
    console.log("Đã xóa toàn bộ dữ liệu trong collection!");
  } catch (error) {
    console.error("Lỗi khi xóa dữ liệu:", error);
  }
}

// Logdata()
async function Logdata() {
  try {
    const ids = "67ca90b98ce0370ab619c9ed";
    // const files = await File.findById(ids)
    const files = await File.find({ folder: "TH" });
    console.log("ds", files)
  } catch (error) {
    console.error("Lỗi khi xóa dữ liệu:", error);
  }
}
