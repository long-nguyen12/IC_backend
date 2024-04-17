const express = require("express");
const userRoutes = require("./api/users/users.router");
const fileRoutes = require("./api/file/file.router");
const folderRoutes = require("./api/folder/folder.router");
const imageRoutes = require("./api/image/image.router");
const describeRoutes = require("./api/describe/describe.router");
const authenticateToken = require("./auth");
const router = express.Router();

router.use("/users", userRoutes);
router.use("/file", authenticateToken, fileRoutes);
router.use("/folder", authenticateToken, folderRoutes);
router.use("/describe", authenticateToken, describeRoutes);
router.use("/image", imageRoutes);

module.exports = router;
