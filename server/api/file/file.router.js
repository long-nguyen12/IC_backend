const express = require("express");
const multer = require("multer");
const path = require("path");
const fileController = require("./file.controller");
const authenticateToken = require("../../auth");

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// router.post("/upload", upload.single("file"), fileController.uploadFile);
router.post(
  "/upload",
  authenticateToken,
  (req, res, next) => {
    console.log(req.user.role);
    // Check if the user has the necessary role to access this route
    if (
      !(req.user.role.includes("upload") || req.user.role.includes("admin"))
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  },
  upload.single("file"),
  fileController.uploadFile
);
router.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = router;
