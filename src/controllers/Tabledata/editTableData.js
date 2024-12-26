const TableDataSchema = require("../../models/TableData");

exports.updateAgent = async (req, res) => {
    const { id } = req.params;
    // const { industry, name, location, entity } = req.body;

    try {
        let dataEntry = await TableDataSchema.findById(id);

        if (!dataEntry) {
            return res.status(404).json({ msg: 'Agent not found' });
        }

        console.log('Agent user ID:', dataEntry.user.toString());
        console.log('Agent user ID:', req.user.id);

        updAgt = await TableDataSchema.findByIdAndUpdate(
            id,
            { industry, name, location, entity },
            { new: true }
        );

        res.status(200).json({msg: 'Agent updated successfully'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
