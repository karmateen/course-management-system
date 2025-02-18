const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    sectionName: { type: String, required: true },

    sectionsCompleted: [
      {
        section: { type: mongoose.Schema.Types.ObjectId, ref: "CourseSection" },
        completed: Boolean,
      },
    ],

    estimatedTime: Number,
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CourseSection", sectionSchema);
