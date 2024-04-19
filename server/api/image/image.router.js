const express = require("express");
const multer = require("multer");
const path = require("path");
const imageController = require("./image.controller");

const router = express.Router();

router.get("/image", imageController.getAllImageName);
router.get("/view-image", imageController.viewImage);
router.get("/download-json", imageController.downloadJson);

module.exports = router;
