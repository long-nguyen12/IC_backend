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
    let nameNotTaken = await validateEmployeename(userName);
    if (!nameNotTaken) {
      return res.status(400).json({
        message: `Tên tài khoản đã được sử dụng`,
      });
    }

    // validate the email
    let emailNotRegistered = await validateEmail(email);
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
      return res.status(404).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(404).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      "your_secret_key",
      {
        expiresIn: "1h",
      }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

const getUserList = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// const editUserRole = async (req, res) => {
//   const { userId, newRole } = req.body;
//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Check if the new role already exists in the user's role array
//     if (!user.role.includes(newRole)) {
//       // If not, push the new role to the user's role array
//       user.role.push(newRole);
//     }

//     // Save the updated user document
//     await user.save();

//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const editUserRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    const user = await User.findById(userId);
    const roleArray = JSON.parse(role);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's roles to match the provided array
    user.role = roleArray;

    // Save the updated user document
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createUser, loginUser, getUserList, editUserRole };
