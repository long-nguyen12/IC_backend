const express = require("express");
const router = express.Router();
const HistoryController = require("./history.controller");

router.get("/systemlogs",HistoryController.getHistories);


module.exports = router;
