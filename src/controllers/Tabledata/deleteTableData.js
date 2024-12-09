const TableSchema = require("../../models/TableData");

// DELETE A RESOURCE
exports.deleteDataEntry = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the DataEntry by ID
        const DataEntry = await TableSchema.findById(id);
        
        // Check if the DataEntry exists
        if (!DataEntry) {
            return res.status(404).json({ msg: 'DataEntry not found' });
        }

        // Ensure the user owns the DataEntry
        if (DataEntry.user.toString() !== req.user.id.toString()) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Delete the DataEntry
        await TableSchema.findByIdAndDelete(id);

        res.status(200).json({ msg: 'DataEntry deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
