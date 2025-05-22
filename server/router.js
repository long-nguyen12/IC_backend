const express = require("express");
const userRoutes = require("./api/users/users.router");
const fileRoutes = require("./api/file/file.router");
const folderRoutes = require("./api/folder/folder.router");
const imageRoutes = require("./api/image/image.router");
const describeRoutes = require("./api/describe/describe.router");
const categoriesRoutes = require("./api/categories/categories.router");
const history = require("./api/history/history.router");
const { authenticateToken }  = require("./auth");
const router = express.Router();

router.use("/users", userRoutes);
router.use("/log", history);
router.use("/file", authenticateToken, fileRoutes);
router.use("/uploads", authenticateToken, folderRoutes);
router.use("/describe", describeRoutes);
router.use("/image", imageRoutes);
router.use("/categories", categoriesRoutes);

module.exports = router;
    