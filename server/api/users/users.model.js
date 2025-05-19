// UserModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email:{
      type: String,
      required: true,
      unique: true,
    },

    avartar : {
      type: String,
    },

    resetToken : {
      type: String,
    },

    resetTokenExpires : {
      type: Date,
    },

    role: {
      type: [String],
      enum: ["upload", "edit", "delete", "admin"],
    },
  },
  { timestamps: true }
);

// Hash password before saving to database
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
