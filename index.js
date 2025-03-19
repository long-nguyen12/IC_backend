// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./server/router");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { getSwaggerDocument } = require("./server/swagger.js");

const app = express();
app.use(cookieParser());
// app.use(cors());

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));

const swaggerDocument = getSwaggerDocument();
const specs = swaggerJsdoc({
  swaggerDefinition: swaggerDocument,
  apis: ["./server/api/*.js"], 
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

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

app.use(express.static(path.join(__dirname + "/static/image")));
app.use("/uploads", express.static("uploads"));

const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
