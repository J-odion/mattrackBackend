exports.updateUserRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
  
      if (!["superAdmin", "viewer", "staff"].includes(role)) {
        return res.status(400).json({ error: "Invalid role." });
      }
  
      const user = await User.findByIdAndUpdate(id, { role }, { new: true });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      res.status(200).json({ message: "Role updated successfully", user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update role", details: err.message });
    }
  };
  