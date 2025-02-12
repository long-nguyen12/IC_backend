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


exports.getFoderAll = async (req, res) => {
  try {
    const { folder, name } = req.query;
    const file = await File.find();
    console.log("file",file)
    file.haveCaption = true;
    await file.save();
    res.status(200).message("Thêm mô tả thành công!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};








exports.getFileByFolder = async (req, res) => {
  try {
    const { folder, page = 1, limit = 25, sort, includes } = req.query;
    console.log("foder",req.query)
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
    // ----------------------------- SHOULD MOVE TO ANOTHER FILE -------------------------------
    // Check if folder have a JSON file
    // const fileJSON = await File.find({
    //   folder,
    //   name: { $regex: /\.(json)$/i },
    // });
    // fileJSON.map((item) => {
    //   var obj;
    //   fs.readFile(
    //     path.join("uploads", item.folder, item.name),
    //     "utf8",
    //     function (err, data) {
    //       if (err) throw err;
    //       obj = JSON.parse(data);
    //       obj.categories.forEach(async (jsonCategory) => {
    //         try {
    //           // Check if the category already exists for the current folder
    //           const existingCategory = await Categories.findOne({
    //             folder: item.name.split("/")[0],
    //             categories_name: jsonCategory.name,
    //           });

    //           // If the category does not exist, create and save it
    //           if (!existingCategory) {
    //             const category = new Categories({
    //               categories_id: jsonCategory.id,
    //               categories_name: jsonCategory.name,
    //               supercategory: jsonCategory.supercategory,
    //               folder: item.name.split("/")[0],
    //             });
    //             await category.save();
    //             console.log(
    //               `Category '${jsonCategory.name}' saved successfully.`
    //             );
    //           }
    //         } catch (error) {
    //           console.error("Error saving category:", error);
    //         }
    //       });
    //       obj.images.forEach(async (image) => {
    //         const describe = {
    //           name: item.name.split("/")[0] + "/" + image.file_name,
    //           folder: item.folder,
    //           bbox: [],
    //           describe: [],
    //           categories_id: [],
    //           categories_name: [],
    //         };
    //         const annotations = obj.annotations.filter(
    //           (annotation) => annotation.image_id === image.id
    //         );

    //         annotations.forEach(async (annotation) => {
    //           if (annotation.caption || annotation.segment_caption) {
    //             describe.describe.push({
    //               caption: annotation?.caption?.toString(),
    //               segment_caption: annotation?.segment_caption?.toString(),
    //             });
    //             const imgFile = await File.findOne({
    //               folder,
    //               name: { $regex: image.file_name, $options: "i" },
    //             });
    //             if (imgFile) {
    //               imgFile.haveCaption = true;
    //               await imgFile.save();
    //             }
    //           }
    //           if (annotation.bbox) {
    //             describe.bbox.push(annotation.bbox);
    //           }
    //           const category = obj.categories.find(
    //             (category) => category.id === annotation.category_id
    //           );
    //           if (category) {
    //             describe.categories_id.push(category.id.toString());
    //             describe.categories_name.push(category.name);
    //           }
    //         });
    //         try {
    //           const existingDescribe = await Describe.findOne({
    //             name: describe.name,
    //           });
    //           if (!existingDescribe) {
    //             await Describe.create(describe);
    //             // await Categories.create(folderCategory);
    //           }
    //         } catch (error) {
    //           console.error("Error saving describe:", error);
    //         }
    //       });
    //     }
    //   );
    // });
    // ----------------------------- SHOULD MOVE TO ANOTHER FILE -------------------------------

    // ---------------------------------
    // if (file.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "Chưa có ảnh nào trong mục này có mô tả!" });
    // }

    res.status(200).json({ file: sortFile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFileInfo = async (req, res) => {
  try {
    const { folder, name } = req.query;
    const file = await File.findOne({ folder, name });
    file.haveCaption = true;
    await file.save();
    res.status(200).message("Thêm mô tả thành công!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadFile = async (req, res ) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  console.log("uerUpdate", req.user)
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
    imagePaths.map((item) => {
      const newFile = new File({
        name: item,
        folder: fileName,     
        path: req.file.path,
      });
      console.log("newFile",newFile)
      newFile.save()
        .then(() =>  HistoryController.createHistory(req.user.userId, req.user.email,`Thêm mới file ${fileName}`, item) )
        .catch((error) => console.error(`Error saving file ${item}:`, error));
    });


    res.status(201).send("File uploaded successfully.");
  } catch (err) {
    res.status(400).json({ message: `ERROR: ${err.message}`});
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
  var zipEntries = zip.getEntries();
  zipEntries.forEach(function (zipEntry) {
    const fileName = zipEntry.entryName.split("/");
    const imageExtension = path.extname(zipEntry.entryName).toLowerCase();
    if (folderPaths.includes(fileName[0])) {
    } else {
      folderPaths.push(fileName[0]);
    }
    if (
      imageExtension === ".jpg" ||
      imageExtension === ".jpeg" ||
      imageExtension === ".png" ||
      imageExtension === ".json"
    ) {
      imagePaths.push(zipEntry.entryName);
    }
  });
  new Promise((resolve, reject) => {
    zip.extractAllToAsync(extractPath, true, (error) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log(`Extracted to "${outputDirectory}" successfully`);
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
  return imagePaths;
}
