const User = require('../../models/user');


// UPDATE STAFF
exports.updateStaff = async (req, res) => {
    const { id } = req.params; // Get staff ID from request params
    const { name, email, role, isVerified } = req.body; // Extract fields from request body

    try {
        let staff = await User.findById(id);
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        // Update allowed fields
        staff.name = name || staff.name;
        staff.email = email || staff.email;
        staff.role = role || staff.role;

        await staff.save(); // Save the updated staff member

        res.status(200).json({ message: "Staff updated successfully", staff });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};
