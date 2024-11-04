const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const imageController = require("./image.controller");





const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = 'static/image';
  
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath); 
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); 
    },
  });
var upload = multer({ storage: storage })



router.get("/image", imageController.getAllImageName);

router.get("/view-image", imageController.viewImage);
router.get("/download-json", imageController.downloadJson);
router.post("/upload",upload.single('image'),imageController.upload);

module.exports = router;
