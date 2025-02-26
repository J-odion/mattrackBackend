const User = require('../../models/user');



//GET ALL RESOURCES
exports.getAllStaff = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.status(200).json(users);
        console.log(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};