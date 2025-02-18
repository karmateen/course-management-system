const express = require("express");
const courseSectionsController = require("../controllers/sections");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { isInstructor } = require("../middlewares/roleAccessMiddleware");

//course Router
const courseSection = express.Router();

//create course section
courseSection.post(
  "/:courseId",
  isAuthenticated,
  isInstructor,
  courseSectionsController.createSection
);
//get all courses
courseSection.get("/", courseSectionsController.getAllSections);

//get a single course
courseSection.get("/:sectionId", courseSectionsController.getSectionById);

//update course
courseSection.put("/:sectionId", courseSectionsController.update);
//delete course
courseSection.delete(
  "/:sectionId",
  isInstructor,
  courseSectionsController.delete
);

module.exports = courseSection;
