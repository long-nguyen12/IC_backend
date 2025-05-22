//swagger.js
const fs = require("fs");
const path = require("path");
const fileURLToPath = require("url");
const SERVER_URL = require("./constant/config.js"); /*  */

// Load the swagger template
const swaggerTemplate = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "./swagger/swagger.json"), "utf-8")
);

// Update the server URL
swaggerTemplate.servers = [
  {
    url: SERVER_URL,
    description: "API server",
  },
];

exports.getSwaggerDocument = () => {
  return swaggerTemplate;
};
