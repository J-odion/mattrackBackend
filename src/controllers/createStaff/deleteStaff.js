const Agents = require("../../models/user");

// DELETE A RESOURCE
exports.deleteAgent = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the agent by ID
        const Agent = await Agents.findById(id);
        
        // Check if the agent exists
        if (!Agent) {
            return res.status(404).json({ msg: 'Agent not found' });
        }

        // Ensure the user owns the agent
        if (Agent.user.toString() !== req.user.id.toString()) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Delete the Agent
        await Agents.findByIdAndDelete(id);

        res.status(200).json({ msg: 'Agent deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
