const express = require("express");
const multer = require("multer");
const path = require("path");
const fileController = require("./file.controller");
const authenticateToken = require("../../auth");
const HistoryController = require("../history/history.controller");
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

router.get("/get-file-name", authenticateToken, fileController.getFileByFolder);
router.put(
  "/update-file-info",
  authenticateToken,
  fileController.updateFileInfo

);

router.get("/foder", authenticateToken, fileController.getFoderAll);

router.post("/updatefile",authenticateToken, fileController.updateFileInfo)
router.post("/singbox",authenticateToken, fileController.SendAI)


router.post(
  "/upload",
  authenticateToken,
  (req, res, next) => {
    console.log(req.user.role);
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


module.exports = router;
