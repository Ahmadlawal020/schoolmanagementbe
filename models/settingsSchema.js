const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    academic: {
      academicYear: { type: String, required: true },
      terms: [
        {
          name: {
            type: String,
            enum: ["First", "Second", "Third", "Summer", "Winter"],
            required: true,
          },
        },
      ],
      activeTerm: {
        type: String,
        enum: ["First", "Second", "Third", "Summer", "Winter"],
      },
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
