const express = require("express");
// const multer = require("multer");
// const path = require("path");
const folderController = require("./folder.controller");

const router = express.Router();

// router.get("/getdatafolder", folderController.getALLFolder);
router.get("/:folderPath(*)?",folderController.getALLFolder);
// router.get("/foder",folderController.getData);

module.exports = router;
