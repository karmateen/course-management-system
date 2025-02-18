const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const CourseSection = require("../models/CourseSection");
const Course = require("../models/course");
const courseSectionsController = {
  // Create a new section
  createSection: asyncHandler(async (req, res) => {
    //section name
    const { sectionName } = req.body;
    //course id
    const { courseId } = req.params;
    //validate mongoose id
    if (!mongoose.isValidObjectId(courseId)) {
      res.status(400);
      throw new Error("Invalid course id");
    }
    //find course
    const course = await Course.findById(courseId);
    // Validate course input
    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }
    // Validate section input
    if (!sectionName) {
      res.status(400);
      throw new Error("Please provide section name");
    }

    // Create section
    const section = await CourseSection.create({
      sectionName,
    });
    // Add section to course
    course.sections.push(section._id);
    await course.save({
      validateBeforeSave: false,
    });
    //send response
    res.status(201).json({
      status: "success",
      data: section,
      message: "Section created successfully",
    });
  }),
  //get all sections
  getAllSections: asyncHandler(async (req, res) => {
    const sections = await CourseSection.find({});
    res.json(sections);
  }),
  // Get a single section
  getSectionById: asyncHandler(async (req, res) => {
    const section = await CourseSection.findById(req.params.sectionId);
    if (section) {
      res.json(section);
    } else {
      res.status(404);
      throw new Error("Section not found");
    }
  }),
  //update section using mongoose method findByIdAndUpdate
  update: asyncHandler(async (req, res) => {
    const section = await CourseSection.findByIdAndUpdate(
      req.params.sectionId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (section) {
      res.json(section);
    } else {
      res.status(404);
      throw new Error("Section not found");
    }
  }),
  //delete section
  delete: asyncHandler(async (req, res) => {
    //find section

    const foundSection = await CourseSection.findById(req.params.sectionId);
    if (!foundSection) {
      res.status(404);
      throw new Error("Section not found");
    }

    res.status(404);
    throw new Error(
      "Section cannot be deleted because it's associated with a course. you can only update it"
    );
  }),
};

module.exports = courseSectionsController;
