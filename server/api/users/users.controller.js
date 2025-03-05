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
    res.status(201).json({  user });
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
        expiresIn: "24h",
      }
    );

    res.cookie('authToken', token, {
      httpOnly: true, // Cookie không thể truy cập từ JavaScript
      secure: false,  // Đặt true nếu bạn chạy trên HTTPS (để dễ dàng phát triển, có thể để false)
      maxAge: 24 * 60 * 60 * 1000, // Cookie tồn tại trong 1 ngày
      sameSite: 'Strict', // Cần thiết để cho phép gửi cookie cross-origin
      Domain:'localhost', // Thay thế bằng tên miền của bạn
      path: '/',
    });


    res.send('oke');
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

const UpdateProFile = async (req, res) => {
  
  try {
    const user = await User.findById(req.user.userId);
    // if (!user.avatar) {
    //   console.log("*********************")
    //   await user.updateMany({}, { $set: { avatar: req.body.avatar } });
    //   user.avatar = req.body.avatar;
    //   await user.save();
    //   return res.status(200).json({ oke: "okiee" });
    // }
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        avartar: req.body.avatar,
        name: "admimmmmm",
       },
      { new: true }  // Trả về tài liệu đã cập nhật
    );


    // user.avartar = req.body.avatar;
    // console.log("user$$$$$$$$$$$$$$",user)
    await updatedUser.save();
    res.status(200).json( updatedUser );
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};




const Logout = async (req, res) => {
  
  try {
    res.cookie('authToken', '', {
        expires: new Date(0),
        httpOnly: true, 
        secure: true    
    });
    res.status(304).json({ error: "Internal server error" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { createUser, loginUser, getUserList, editUserRole,Logout,UpdateProFile };
