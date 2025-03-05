const mongoose = require("mongoose");

const standardAllocationSchema = new mongoose.Schema(
  {
    purpose: {
      type: String,
      required: true,
    },
    houseType: {
      type: String,
      required: true,
    },
    siteLocation: {
      type: String,
      required: true,
    },
    materials: [
      {
        materialName: { type: String, required: true },
        maxQuantity: { type: Number, required: true },
        unit: { type: String, required: true },
      },
    ],
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// 🔹 Create a compound unique index on purpose, houseType, and siteLocation
standardAllocationSchema.index({ purpose: 1, houseType: 1, siteLocation: 1 }, { unique: true });

const StandardAllocation = mongoose.model("StandardAllocation", standardAllocationSchema);
module.exports = StandardAllocation;





// const mongoose = require("mongoose");

// const standardAllocationSchema = new mongoose.Schema(
//   {
//     purpose: {
//       type: String,
//       required: true,
//     },
//     houseType: {
//       type: String,
//       required: true,
//     },
//     siteLocation: {
//       type: String,
//       required: true,
//     },
//     materials: [
//       {
//         materialName: { type: String, required: true },
//         maxQuantity: { type: Number, required: true },
//         unit: { type: String, required: true },
//       },
//     ],
//     createdBy: {
//       type: String,
//       required: true,
//     },
//     updatedBy: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const StandardAllocation = mongoose.model("StandardAllocation", standardAllocationSchema);
// module.exports = StandardAllocation;
