const staffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: {
      type: String,
      enum: ["storeKeeper", "projectManager", "engineer"],
      required: true,
    },
  });
  
  const Staff = mongoose.model("Staff", staffSchema);
  module.exports = Staff;
  