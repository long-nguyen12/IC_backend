// UserRouter.js
const express = require("express");
const router = express.Router();
const { getCategoriesList } = require("./categories.controller");

router.get("/categories_all", getCategoriesList);

module.exports = router;
