exports.authorizeRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
  
  exports.authorizeResourceAccess = async (req, res, next) => {
    const resourceId = req.params.id;
    const resource = await TableData.findById(resourceId).populate("assignedUsers");
  
    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }
  
    if (!resource.assignedUsers.some((user) => user._id.toString() === req.user.id)) {
      return res.status(403).json({ message: "Access denied." });
    }
  
    next();
  };
  

  export const checkAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
  };