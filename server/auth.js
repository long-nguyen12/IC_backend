// authMiddleware.js
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {

 
  const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];
  const token = req.cookies.authToken

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, "your_secret_key", (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }
    console.log("user",user)
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
