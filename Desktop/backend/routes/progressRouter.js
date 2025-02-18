const express = require("express");
const progressController = require("../controllers/progressController");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { isStudent, isAdmin } = require("../middlewares/roleAccessMiddleware");

//course Router
const progressRouter = express.Router();

//get all courses
progressRouter.get("/", isAuthenticated, progressController.getUserProgress);
//apply to course
progressRouter.post(
  "/apply",
  isAuthenticated,
  isStudent,
  progressController.applyToCourse
);
//update course section
progressRouter.put(
  "/update",
  isAuthenticated,
  isAdmin,
  progressController.updateSectionProgress
);
//start section
progressRouter.put(
  "/start-section",
  isAuthenticated,
  progressController.startSection
);

module.exports = progressRouter;
 