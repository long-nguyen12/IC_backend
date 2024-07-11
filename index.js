// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./server/router");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose
  .connect(
    "mongodb+srv://huygaming04:dnhuy2012@imagecaptioning.rzqchro.mongodb.net/?retryWrites=true&w=majority&appName=ImageCaptioning"
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

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
