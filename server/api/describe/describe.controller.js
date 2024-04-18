const Describe = require("./describe.model");

async function getAllDescribes(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Calculate the number of documents to skip
    const skip = (pageNumber - 1) * limitNumber;

    // Retrieve documents with pagination
    const describes = await Describe.find().skip(skip).limit(limitNumber);

    // Check if any documents were found
    if (describes.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy dữ liệu" });
    }

    res.status(200).json({ describes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createDescribe(req, res) {
  try {
    const { name, describe } = req.body;
    let existingDescribe = await Describe.findOne({ name });

    // If a document with the name exists, update its describe field
    if (existingDescribe) {
      return updateDescribe(req, res);
    }
    const describeArray = JSON.parse(describe);
    const newDescribe = new Describe({
      name,
      describe: describeArray,
    });
    await newDescribe.save();
    res.status(200).json({ message: "Lưu mô tả thành công" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

async function getDescribeByName(req, res) {
  try {
    if (!req.query.name) {
      res.status(400).message("Cần tên dữ liệu");
    }
    // console.log(req.query.name);
    let describe = await Describe.findOne({ name: req.query.name });
    // console.log(describe);
    if (!describe) {
      res.status(404).message("Không tìm thấy dữ liệu");
    }
    res.status(201).json({ describe: describe });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

async function updateDescribe(req, res) {
  try {
    const { name, describe } = req.body;
    const describeArray = JSON.parse(describe);

    // Find the document by name
    let existingDescribe = await Describe.findOne({ name });

    // If the document does not exist, return a 404 Not Found response
    if (!existingDescribe) {
      return res.status(404).json({ message: "Không tìm thấy dữ liệu" });
    }

    // Update the describe field with the new value
    existingDescribe.describe = describeArray;

    // Save the updated document
    await existingDescribe.save();

    // Return a success response
    res.status(200).json({ message: "Cập nhật mô tả thành công" });
  } catch (error) {
    // Handle any errors and return a 500 Internal Server Error response
    res.status(500).json({ error: error.message });
  }
}

module.exports = { createDescribe, getDescribeByName, getAllDescribes };
