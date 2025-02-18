const express = require("express");
const usersController = require("../controllers/users");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

const usersRouter = express.Router();

// Register route
usersRouter.post("/register", usersController.register);
// user profile
usersRouter.get("/profile", isAuthenticated, usersController.profile);
usersRouter.post("/login", usersController.login);
// usersRouter.post("/logout", usersController.logoutUser);
usersRouter.get("/position/:courseId", usersController.getAllUsers);
//private profile
usersRouter.get(
  "/profile/private",
  isAuthenticated,
  usersController.privateProfile
);
usersRouter.get(
  "/checkAuthenticated",
  isAuthenticated,
  usersController.checkAuthenticated
);
//logout
usersRouter.post("/logout", usersController.logout);
//get user by id
// usersRouter.get("/:id", usersController.getUserById);

module.exports = usersRouter;
