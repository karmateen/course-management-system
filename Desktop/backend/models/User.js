const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "instructor", "student"] },
    progress: [
      {
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        sections: [
          {
            sectionId: {
              type: Schema.Types.ObjectId,
              ref: "CourseSection",
              required: true,
            },
            status: {
              type: String,
              enum: ["Not Started", "In Progress", "Completed"],
              default: "Not Started",
            },
          },
        ],
      },
    ],
    coursesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    coursesApplied: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

module.exports = mongoose.model("User", userSchema);
