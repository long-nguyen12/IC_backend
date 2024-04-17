// UserController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./users.model");

async function createUser(req, res) {
  try {
    const { userName, password, email } = req.body;

    const validateEmployeename = async (name) => {
      let employee = await User.findOne({ userName });
      return employee ? false : true;
    };

    //Get employee from database with same email if any
    const validateEmail = async (email) => {
      let employee = await User.findOne({ email });
      return employee ? false : true;
    };
    // Validate the name
    let nameNotTaken = await validateEmployeename(req.userName);
    if (!nameNotTaken) {
      return res.status(400).json({
        message: `Tên tài khoản đã được sử dụng`,
      });
    }

    // validate the email
    let emailNotRegistered = await validateEmail(req.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email đã được sử dụng`,
      });
    }

    const user = new User({
      userName,
      password,
      email,
      role: ["edit"],
    });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

async function loginUser(req, res) {
  try {
    const { userName, password } = req.body;
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      "your_secret_key",
      {
        expiresIn: "3h",
      }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { createUser, loginUser };
