const AgentSchema = require("../../models/TableData");


exports.getAllData = async (req, res) => {
    try {
      const data = await TableData.find();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch data", details: err.message });
    }
  };