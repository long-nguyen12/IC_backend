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
    // for (const file of files) {
    //   console.log(file.fileHeader.name.match(/\.(jpg|jpeg|png|gif)$/i));
    //   // if (file.type === "FILE") {
    //   //   const fileName = path.basename(file.fileHeader.name);
    //   //   const imageExtension = path.extname(fileName).toLowerCase();
    //   //   const entryPath = path.join(extractPath, fileName);

    //   //   if (
    //   //     imageExtension === ".jpg" ||
    //   //     imageExtension === ".jpeg" ||
    //   //     imageExtension === ".png"
    //   //   ) {
    //   //     // If it's an image file, extract it to the folder with the RAR file name
    //   //     await fs.promises.mkdir(extractPath, { recursive: true });
    //   //     await file.extract(extractPath);
    //   //     imagePaths.push(entryPath);
    //   //   }
    //   // }
    // }
  } catch (err) {
    console.error(err);
  }

  return imagePaths;
}
