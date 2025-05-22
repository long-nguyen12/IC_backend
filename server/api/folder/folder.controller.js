const fs = require("fs");
const path = require("path");
const File = require("../file/file.model");
const Folder = require("./folder.model");

// const getImageDb = async () => {
//   const file = await File.find();
//   return img
// }

const formatToWindowsPath = (filePath) => {
  return filePath.replace(/\//g, "\\");
};


const getFolderData = async (dir) => {
  try {
    const folderData = await Folder.find({_id: dir});
    const listImg = await File.find({Id_folder: dir});
    console.log("link",dir)
    // return folderData;
    return { name: folderData.name, children: [], images: listImg, otherFiles: [] };
    // res.status(200).json({ message: "Danh sách tất cả các thư mục." });
  } catch (err) {
    console.error("Lỗi khi đọc thư mục:", err);
    return { name: path.basename(dir), path: dir, children: [], images: [], otherFiles: [] };
  }
};





exports.getData = async (req, res) => {

  let folderPath = req.params.folderPath || "";

  // if (!fs.existsSync(folderPath)) {
  //   return res.status(404).json({ message: "Thư mục không tồn tại 123." });
  // }
  console.log("folderPath",folderPath)
  // const data = await getFolderData(folderPath);
  const data ="dsad"
  
  res.status(200).json({ message: "Danh sách thư mục và filessss.",data });
};



exports.getFolder = async (req, res) => {
  console.log("query",req)
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
    const Id_folder = req.query.Id_folder
    if(Id_folder === "all"){
      console.log(req.query)
      const folders = await Folder.find().sort({ createdAt: 1 });
      res.status(200).json({ name:"", path: "", children: folders, images: [], otherFiles: [] });
    }else{
      const data = await getFolderData(Id_folder);
      res.status(200).json(data);
    }
     
  } catch (err) {
   
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
  }
};


