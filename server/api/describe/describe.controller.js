const Describe = require("./describe.model");

async function createDescribe(req, res) {
  try {
    const { name, describe } = req.body;

    // const validateName = async (name) => {
    //   let describe = await Describe.findOne({ name });
    //   return describe ? false : true;
    // };

    // // Validate the name
    // let nameNotTaken = await validateName(req.name);
    // if (!nameNotTaken) {
    //   return res.status(400).json({
    //     message: `Tên tài khoản đã được sử dụng`,
    //   });
    // }

    const newDescribe = new Describe({
      name,
      describe,
    });
    await newDescribe.save();
    res.status(201).json({ message: "Lưu mô tả thành công" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

async function getDescribeByName(req, res) {
  // let describe = await Describe.findOne({ name: req.query.name.toString() });
  // console.log(describe);
  try {
    if (!req.query.name) {
      res.status(400).message("Cần tên dữ liệu");
    }
    let describe = await Describe.findOne({ name: req.query.name.toString() });
    if (!describe) {
      res.status(404).message("Không tìm thấy dữ liệu");
    }
    // // Validate the name
    // let nameNotTaken = await validateName(req.name);
    // if (!nameNotTaken) {
    //   return res.status(400).json({
    //     message: `Tên tài khoản đã được sử dụng`,
    //   });
    // }
    // await newDescribe.save();
    res.status(201).json({ describe: describe });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

module.exports = { createDescribe, getDescribeByName };
