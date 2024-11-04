// UserModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const historySchema = new mongoose.Schema(
{
    userId: {
        type: String,
        required: true,
    },

    Email: {
        type: String,
        required: true,
    },

    action: {
        type: String,
        required: true,
    },
 
    timestamp: {
        type: Date,
        default: Date.now,
    },
},
{ timestamps: true }
);


const History = mongoose.model("History", historySchema);

module.exports = History;
