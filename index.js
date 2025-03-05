// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./server/router");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
var path = require('path')



const app = express();
app.use(cookieParser());
app.use(cors({
  origin: 'http://ic.ailabs.io.vn', // Địa chỉ client
  credentials: true // Cho phép gửi cookies
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

mongoose
  .connect(
    "mongodb://root:root1234@ailabs.ddns.net:27017/ic?connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-256"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

// Use user routes
app.use("/api", router);
// app.use("/api", fileRoutes);
app.use(express.static(path.join(__dirname + '/static/image')))

const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
