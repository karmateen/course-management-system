const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Course = require("../models/course");

const progressController = {
  applyToCourse: asyncHandler(async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user._id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already enrolled in the course
    const isAlreadyEnrolled = user.progress.some(
      (progress) => progress.courseId.toString() === courseId
    );

    if (isAlreadyEnrolled) {
      return res
        .status(400)
        .json({ message: "You have already enrolled in this course" });
    }

    // Validate the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Add the course to user's progress
    user.progress.push({ courseId, sections: [] });
    await user.save({
      validateBeforeSave: false,
    });
    //push the user to the course
    course.students.push(userId);
    await course.save({
      validateBeforeSave: false,
    });

    res.status(200).json({ message: "Application to course successful" });
  }),
  // Method to update section progress
  updateSectionProgress: asyncHandler(async (req, res) => {
    const { courseId, sectionId, newStatus } = req.body;
    console.log("req.body", req.body);
    const userId = req.user._id;
    // Find the user and the specific course progress
    const user = await User.findOne({
      _id: userId,
      "progress.courseId": courseId,
    });
    if (!user) {
      return res.status(404).json({ message: "User or course not found" });
    }

    // Find and update the specific section status
    const courseProgress = user.progress.find((p) => {
      return p.courseId.toString() === courseId;
    });

    const sectionProgress = courseProgress.sections.find(
      (s) => s.sectionId.toString() === sectionId
    );
    if (sectionProgress) {
      sectionProgress.status = newStatus; // Update the status
    } else {
      // Optionally handle case where the section doesn't exist in user's progress
      return res
        .status(404)
        .json({ message: "Section not found in user's progress" });
    }

    await user.save({
      validateBeforeSave: false,
    });
    res.status(200).json({ message: "Section progress updated successfully" });
  }),
  // Method to start a section
  startSection: asyncHandler(async (req, res) => {
    const { courseId, sectionId } = req.body;
    const userId = req.user._id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find course progress
    const courseProgress = user.progress.find(
      (p) => p.courseId.toString() === courseId
    );
    if (!courseProgress) {
      return res
        .status(404)
        .json({ message: "Course not found in user's progress" });
    }

    // Check if the section is already started
    const existingSection = courseProgress.sections.find(
      (s) => s.sectionId.toString() === sectionId
    );
    if (existingSection) {
      return res.status(400).json({ message: "Section already started" });
    }

    // Add the new section to the course progress
    courseProgress.sections.push({
      sectionId: sectionId,
      status: "Not Started",
    });

    await user.save({
      validateBeforeSave: false,
    });
    res.status(200).json({ message: "Section started successfully" });
  }),
  // Method to get user progress
  getUserProgress: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId).populate(
      "progress.courseId progress.sectionId progress.lectureId"
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user.progress);
  }),
};

module.exports = progressController;
