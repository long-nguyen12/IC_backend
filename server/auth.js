// authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = req.cookies.authToken;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, "your_secret_key", (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }

    req.user = user;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = req.cookies.authToken;
    if (!token)
      return res
        .status(401)
        .json({ message: "Không có token, từ chối truy cập" });
    const decoded = jwt.verify(token, "your_secret_key");
    console.log("decoded", decoded);
    const role = decoded.role;
    if (!role.includes("admin")) {
      return res.status(403).json({ message: "Bạn không có quyền admin" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = { authenticateToken, verifyAdmin };
