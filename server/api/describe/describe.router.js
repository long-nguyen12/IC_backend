// UserRouter.js
const express = require("express");
const router = express.Router();
const {
  createDescribe,
  getDescribeByName,
  getAllDescribes,
  getAllDataByFolder,
  getAllDescribesByFolder,
} = require("./describe.controller");
const multer = require("multer");
const {authenticateToken} = require("../../auth");

const upload = multer();

router.post(
  "/describe",
  authenticateToken,
  (req, res, next) => {
    // Check if the user has the necessary role to access this route
    if (!(req.user.role.includes("edit") || req.user.role.includes("admin"))) {
      return res.status(403).json({ error: "Không có quyền truy cập" });
    }
    next();
  },
  upload.none(),
  createDescribe
);
router.get("/describe_all", getAllDescribes);
router.get("/describe_all_by_folder", getAllDescribesByFolder);
router.get("/describe", getDescribeByName);
router.get("/create_json", getAllDataByFolder);

module.exports = router;
