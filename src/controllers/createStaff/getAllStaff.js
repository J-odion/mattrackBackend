const AgentSchema = require("../../models/agents");


//GET ALL RESOURCES
exports.getAllAgents = async (req, res) => {
    try {
        const userAgents = await AgentSchema.find({ user: req.user.id });
        res.status(200).json(userAgents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};