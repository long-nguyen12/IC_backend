const fs = require("fs");
const path = require("path");


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
