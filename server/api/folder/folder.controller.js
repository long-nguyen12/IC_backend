const fs = require("fs");
const path = require("path");


const getFolderData = (dir) => {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    // Lấy danh mục con
    const children = items
      .filter((item) => item.isDirectory())
      .map((folder) => {
        const folderPath = path.join(dir, folder.name);
        return {
          name: folder.name,
          path: folderPath,
          children: getFolderData(folderPath).children,
          images: getFolderData(folderPath).images,
          otherFiles: getFolderData(folderPath).otherFiles,
        };
      });

    const images = [];
    const otherFiles = [];
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"];

    items.filter((item) => item.isFile()).forEach((file) => {
      const filePath = path.join(dir, file.name);
      const ext = path.extname(file.name).toLowerCase();

      if (imageExtensions.includes(ext)) {
        images.push({ name: file.name, path: filePath });
      } else {
        otherFiles.push({ name: file.name, path: filePath });
      }
    });

    return { name: path.basename(dir), path: dir, children, images, otherFiles };
  } catch (err) {
    console.error("Lỗi đọc thư mục:", err);
    return { name: path.basename(dir), path: dir, children: [], images: [], otherFiles: [] };
  }
};


exports.getData = (req, res) => {
  let folderPath = req.params.folderPath || "";

  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ message: "Thư mục không tồn tại 123." });
  }

  const data = getFolderData(folderPath);
  res.status(200).json({ message: "Danh sách thư mục và file.", data });
};



exports.getFolder = async (req, res) => {
  try {
    // Check if the "uploads" directory exists, if not, create it
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }

    // Function to recursively scan folders and subfolders
    const scanFolders = (dir, parent = '') => {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      // Filter out only directories
      const folders = items.filter((item) => item.isDirectory());

      // Initialize an array to store folder names
      const folderNames = [];

      // Iterate through the folders
      for (const folder of folders) {
        // Get the path of the current folder
        const folderPath = path.join(dir, folder.name);

        // Check if the current folder contains any subfolders
        const subFolders = scanFolders(folderPath, path.join(parent, folder.name));

        // If there are subfolders, add them to the list of folder names
        if (subFolders.length > 0) {
          folderNames.push(...subFolders);
        } else {
          // If the current folder doesn't contain subfolders,
          // add its path to the list of folder names
          folderNames.push(path.join(parent, folder.name));
        }
      }

      // Return the list of folder names
      return folderNames;
    };

    // Get the list of folders in the "uploads" directory
    const folderList = scanFolders("uploads");

    // Check if there are any folders found
    if (folderList.length > 0) {
      res.status(200).json({ data: folderList });
    } else {
      res.status(200).send("No data has been uploaded yet.");
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};




exports.getALLFolder = async (req, res) => {
  try {
    const uploadsDir = "uploads";
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    const buildFolderTree = (dir, parentPath = dir) => {
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
    
        // Lấy danh mục con
        const children = items
          .filter((item) => item.isDirectory())
          .map((folder) => {
            const folderPath = path.join(dir, folder.name);
            return {
              name: folder.name,
              path: folderPath,
              children: getFolderData(folderPath).children,
              images: getFolderData(folderPath).images, // Lọc hình ảnh
              otherFiles: getFolderData(folderPath).otherFiles, // Lọc file khác
            };
          });
    
        // Lấy file và phân loại
        const images = [];
        const otherFiles = [];
        const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"];
    
        items.filter((item) => item.isFile()).forEach((file) => {
          const filePath = path.join(dir, file.name);
          const ext = path.extname(file.name).toLowerCase();
    
          if (imageExtensions.includes(ext)) {
            images.push({ name: file.name, path: filePath });
          } else {
            otherFiles.push({ name: file.name, path: filePath });
          }
        });
    
        return { name: path.basename(dir), path: dir, children, images, otherFiles };
      } catch (err) {
        console.error("Lỗi đọc thư mục:", err);
        return { name: path.basename(dir), path: dir, children: [], images: [], otherFiles: [] };
      }
    };

    // Xây dựng cây danh mục từ thư mục "uploads"
    const folderTree = buildFolderTree(uploadsDir);

    res.status(200).json({
      message: "Cây danh mục kèm file.",
      data: folderTree,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
  }

  
};


