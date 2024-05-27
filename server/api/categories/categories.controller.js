const Categories = require("./categories.model");

const getCategoriesList = async (req, res) => {
    try {
      const categories = await Categories.find({});
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

module.exports = { getCategoriesList };
