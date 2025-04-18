const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    fileCount: {
        type: Number,
        default: 0
    }
   
});

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;