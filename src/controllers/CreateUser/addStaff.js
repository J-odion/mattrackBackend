exports.addStaff = async (req, res) => {
    try {
      const { name, department } = req.body;
  
      if (!name || !department) {
        return res.status(400).json({ error: "Name and department are required." });
      }
  
      const staff = new Staff({ name, department });
      await staff.save();
      res.status(201).json({ message: "Staff added successfully", staff });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add staff", details: err.message });
    }
  };
  
  exports.getStaff = async (req, res) => {
    try {
      const staff = await Staff.find();
      res.status(200).json(staff);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch staff", details: err.message });
    }
  };
  