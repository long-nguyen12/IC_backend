const express = require("express");
const multer = require("multer");
const path = require("path");
const folderController = require("./folder.controller");

const router = express.Router();

router.get("/folder", folderController.getFolder);

module.exports = router;
