const express = require("express");
// const multer = require("multer");
// const path = require("path");
const folderController = require("./folder.controller");

const router = express.Router();

router.get("/all", folderController.getALLFolder);
router.get("/:folderPath(*)?",folderController.getData);
router.get("/foder",folderController.getData);

module.exports = router;
