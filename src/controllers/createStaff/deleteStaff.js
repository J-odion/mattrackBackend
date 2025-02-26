const Staffs = require("../../models/user");

// DELETE A RESOURCE
exports.deleteStaff = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the Staff by ID
        const Staff = await Staffs.findById(id);
        
        // Check if the Staff exists
        if (!Staff) {
            return res.status(404).json({ msg: 'Staff not found' });
        }

        // Ensure the user owns the Staff
        if (Staff.user.toString() !== req.user.id.toString()) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Delete the Staff
        await Staffs.findByIdAndDelete(id);

        res.status(200).json({ msg: 'Staff deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
