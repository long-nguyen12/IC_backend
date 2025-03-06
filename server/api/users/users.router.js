// UserRouter.js
const express = require("express");
const multer = require("multer");
const router = express.Router();
const User = require("./users.model");
const {
  createUser,
  loginUser,
  Logout,
  getUserList,
  editUserRole,
  UpdateProFile,
  DeletedUser,
  UpdateInfoUser
} = require("./users.controller");

const { authenticateToken, verifyAdmin }  = require("../../auth");

const upload = multer();

router.post("/register",authenticateToken, upload.none(), createUser);
router.post("/login", loginUser);
router.get("/logout", Logout);
router.get("/user",authenticateToken,getUserList);
router.put("/update",authenticateToken, UpdateProFile);
router.put("/edit",authenticateToken, UpdateInfoUser);


router.delete("/delete/:id",verifyAdmin, DeletedUser);

router.put(
  "/user",
  authenticateToken,
  (req, res, next) => {
    console.log(req.user.role);
    // Check if the user has the necessary role to access this route
    if (!req.user.role.includes("admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  },
  upload.none(),
  editUserRole
);
router.get("/user_info", authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Assuming user ID is stored in the token as 'user_id'

  try {
    // Use userId to fetch user information from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
