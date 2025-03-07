const File = require("./file.model");
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
    console.log(fileName)

    const filePath = path.join(__dirname, "..", "..", "..", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    await axios
      .post("http://icai.ailabs.io.vn/v1/api/detection", formData, {
        headers: {
          ...formData.getHeaders(),
        },
      })
      .then(async (response) => {
        const fileAI = await File.findOneAndUpdate(
          { _id: req.body.id },
          { $set: { describe: response.data.dectect_path } },
          { returnDocument: "after" }
        );
        res.status(200).json(fileAI);
      })
      .catch((error) => {
        console.error("Lỗi upload:", error.message);
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
  const filePath = req.file.path;
  const fileName = path.basename(filePath, path.extname(filePath));
  
  try {
    let imagePaths = [];

    if (fileExtension === ".zip") {
      imagePaths = await unzipDirectory(filePath, fileName);
    } else if (fileExtension === ".rar") {
      imagePaths = await extractImagesFromRar(filePath, fileName);
    } else {
      return res
        .status(400)
        .send("Unsupported file format. Please upload a zip or rar file.");
    }
    const savePromises = [];
    console.log("item---------",imagePaths)


    imagePaths.map((item) => {

      const newFile = new File({
        name: item,
        folder: fileName,
        path: req.file.path,
      });
      newFile.save()
      //   .then(() =>  HistoryController.createHistory(req.user.userId, req.user.email,`Thêm mới file ${path}`, item) )
      //   .catch((error) => console.error(`Error saving file ${item}:`, error));
    });

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

// async function unzipDirectory(inputFilePath, outputDirectory) {
//   const imagePaths = [];
//   const folderPaths = [];
//   const extractPath = path.join("uploads", outputDirectory);
//   const zip = new AdmZip(inputFilePath);
//   var zipEntries = zip.getEntries();
//   zipEntries.forEach(function (zipEntry) {
//     const fileName = zipEntry.entryName.split("/");
//     const imageExtension = path.extname(zipEntry.entryName).toLowerCase();
//     console.log("")

//     if (folderPaths.includes(fileName[0])) {
//     } else {
//       folderPaths.push(fileName[0]);
//     }
//     if (
//       imageExtension === ".jpg" ||
//       imageExtension === ".jpeg" ||
//       imageExtension === ".png" ||
//       imageExtension === ".json"
//     ) {
//       imagePaths.push(zipEntry.entryName);
//     }
//   });
//   new Promise((resolve, reject) => {
//     zip.extractAllToAsync(extractPath, true, (error) => {
//       if (error) {
//         console.log(error);
//         reject(error);
//       } else {
//         console.log(`Extracted to "${outputDirectory}" successfully`);
//         processImagesInFolder(extractPath);
//         resolve();
//       }
//     });
//   });

//   return imagePaths;
// }




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

    // Chỉ lưu ảnh và JSON
    if ([".jpg", ".jpeg", ".png", ".json"].includes(imageExtension)) {
      const relativePath = path.join("uploads", outputDirectory, zipEntry.entryName); // Giữ nguyên "uploads"
      imagePaths.push(relativePath);
    }
  });

  // Đảm bảo thư mục tồn tại trước khi giải nén
  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true });
  }

  await new Promise((resolve, reject) => {
    zip.extractAllToAsync(extractPath, true, (error) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log(`Extracted to "${extractPath}" successfully`);
        processImagesInFolder(extractPath);
        resolve();
      }
    });
  });

  return imagePaths;
}


async function extractImagesFromRar(filePath, folderName) {
  const imagePaths = [];
  const listFolder = [];
  const extractPath = path.join("uploads", folderName);

  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true });
  }

  try {
    const extractor = await createExtractorFromFile({
      filepath: filePath,
      targetPath: extractPath,
    });
    const list = extractor.getFileList();
    const extractedFiles = [...extractor.extract().files];
    for (const file of extractedFiles) {
      const fileName = path.basename(file.fileHeader.name);
      if (file.fileHeader.name.includes("/")) {
        if (!listFolder.includes(file.fileHeader.name.split("/")[0])) {
          listFolder.push(file.fileHeader.name.split("/")[0]);
        }
        imagePaths.push(file.fileHeader.name);
      } else {
        imagePaths.push(fileName);
      }
    }
  } catch (err) {
    console.error(err);
  }

  await processImagesInFolder(extractPath);
  return imagePaths;
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

    // console.log(`Resized: ${imagePath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error);
    throw error;
  }
}

/**
 * Process all images inside extracted folder (Resize while extracting)
 */
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
    await File.deleteMany({});
    console.log("Đã xóa toàn bộ dữ liệu trong collection!");
  } catch (error) {
    console.error("Lỗi khi xóa dữ liệu:", error);
  }
}



// Logdata() 
async function Logdata() {
  try {
    const files = await File.find()
   // Sắp xếp theo createdAt (mới nhất trước)


    console.log("ds",files)
  } catch (error) {
    console.error("Lỗi khi xóa dữ liệu:", error);
  }
}
