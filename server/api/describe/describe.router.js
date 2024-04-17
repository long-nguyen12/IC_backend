// UserRouter.js
const express = require("express");
const router = express.Router();
const { createDescribe, getDescribeByName } = require("./describe.controller");

router.post("/describe", createDescribe);
router.get("/describe", getDescribeByName);

module.exports = router;
