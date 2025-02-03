const AgentSchema = require("../../models/agents");

exports.updateAgent = async (req, res) => {
    const { id } = req.params;
    const { industry, name, location, entity } = req.body;

    try {
        let userAgents = await AgentSchema.findById(id);

        if (!userAgents) {
            return res.status(404).json({ msg: 'Agent not found' });
        }

        console.log('Agent user ID:', userAgents.user.toString());
        console.log('Agent user ID:', req.user.id);

        // Ensure the user owns the resource
        if (userAgents.user.toString() !== req.user.id ) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        updAgt = await AgentSchema.findByIdAndUpdate(
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
