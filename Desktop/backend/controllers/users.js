const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Course = require("../models/course");

const usersController = {
  //--register user
  register: asyncHandler(async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validate user input
      if (!username || !email || !password) {
        res.status(400);
        throw new Error("Please add all fields");
      }

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        res.status(400);
        throw new Error("User already exists");
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();
      if (newUser) {
        res.status(201).json({
          _id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          // You can also generate a token here if you're implementing JWT
        });
      } else {
        res.status(400);
        throw new Error("Invalid user data");
      }
    } catch (error) {
      throw new Error(error);
    }
  }),

  //---login user
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log("req.body", req.body);
    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      // res.status(401);
      throw new Error("Invalid email or password");
    }

    // Check if password matches
    // const isMatch = await bcrypt.compare(password, user.password);

    // if (!isMatch) {
    //   res.status(401);
    //   throw new Error("Invalid email or password");
    // }

    // User authenticated, generate a token
    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
      expiresIn: "30d", // Token expires in 30 days
    });

    // Set token in HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // The cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "strict", // Strictly same site
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    // Send response
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      // No need to send the token in the response body
    });
  }),
  //get all users
  getAllUsers: asyncHandler(async (req, res) => {
    const courseId = req.params.courseId; // Get course ID from query parameters

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const users = await User.find({}).populate({
      path: "progress",
      populate: {
        path: "courseId",
        model: "Course",
        match: { _id: courseId },
        populate: {
          path: "sections",
          model: "CourseSection",
        },
      },
    });

    let userProgressData = users
      .map((user) => {
        const courseProgress = user.progress.find(
          (cp) => cp.courseId && cp.courseId._id.toString() === courseId
        );

        if (!courseProgress) {
          return null;
        }

        const totalSections = courseProgress.courseId.sections.length;
        const sectionsCompleted = courseProgress.sections.filter(
          (section) => section.status === "Completed"
        ).length;
        const progressPercentage =
          totalSections > 0
            ? parseFloat(((sectionsCompleted / totalSections) * 100).toFixed(1))
            : 0;

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          totalSections,
          sectionsCompleted,
          progressPercentage,
          position: null, // Position will be determined after sorting
          username: user.username,
          dateJoined: user?.createdAt,
        };
      })
      .filter((item) => item !== null); // Remove users without progress in the specified course

    // Sort users based on sectionsCompleted and assign positions
    // Sort users based on sectionsCompleted
    userProgressData.sort((a, b) => b.sectionsCompleted - a.sectionsCompleted);

    // Assign positions with dense ranking
    let lastRank = 0;
    let lastSectionsCompleted = -1;
    userProgressData.forEach((user) => {
      if (user.sectionsCompleted !== lastSectionsCompleted) {
        lastRank++;
        lastSectionsCompleted = user.sectionsCompleted;
      }
      user.position = `${lastRank}${
        ["st", "nd", "rd"][((((lastRank + 90) % 100) - 10) % 10) - 1] || "th"
      }`;
    });

    res.json(userProgressData);
  }),

  //get user by id
  getUserById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate({
      path: "progress",
      populate: {
        path: "courseId",
        model: "Course",
        populate: {
          path: "sections",
          model: "CourseSection",
        },
      },
    });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user);
  }),
  //get user progress
  getUserProgress: asyncHandler(async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id).populate({
      path: "progress",
      populate: {
        path: "courseId",
        model: "Course",
        populate: {
          path: "sections",
          model: "CourseSection",
        },
      },
    });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user.progress);
  }),
  // user profile
  profile: asyncHandler(async (req, res) => {
    const { id } = req.user;
    const courseIdParam = req.query.courseId; // Get the course ID from the request query
    const user = await User.findById(id).populate({
      path: "progress",
      populate: [
        {
          path: "courseId",
          model: "Course",
          populate: {
            path: "sections",
            model: "CourseSection",
          },
        },
        {
          path: "sections.sectionId",
          model: "CourseSection",
        },
      ],
    });
    console.log("user", user);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    console.log("user", user);
    // Filter progress for a specific course if courseIdParam is provided
    const courseProgress = courseIdParam
      ? user?.progress?.find(
          (p) => p.courseId?._id?.toString() === courseIdParam
        )
      : null;

    // If a specific course progress is found, calculate its summary
    let progressSummary = null;
    if (courseProgress) {
      const totalSections = courseProgress.courseId.sections?.length;
      let completed = 0,
        ongoing = 0,
        notStarted = 0;

      courseProgress.sections.forEach((section) => {
        if (section.status === "Completed") completed++;
        else if (section.status === "In Progress") ongoing++;
        else notStarted++;
      });

      progressSummary = {
        courseId: courseProgress.courseId._id,
        courseTitle: courseProgress.courseId.title,
        totalSections,
        completed,
        ongoing,
        notStarted,
      };
    }

    res.json({ user, courseProgress, progressSummary });
  }),
  //private profile
  privateProfile: asyncHandler(async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id).populate({
      path: "progress",
      populate: {
        path: "courseId",
        model: "Course",
        populate: {
          path: "sections",
          model: "CourseSection",
        },
      },
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Calculating the progress statistics for each course
    const coursesProgress = user.progress.map((courseProgress) => {
      const totalSections = courseProgress.courseId.sections.length;
      let completed = 0,
        ongoing = 0,
        notStarted = 0;

      courseProgress.sections.forEach((section) => {
        if (section.status === "Completed") completed++;
        else if (section.status === "In Progress") ongoing++;
        else notStarted++;
      });

      return {
        courseId: courseProgress.courseId._id,
        courseTitle: courseProgress.courseId.title,
        totalSections,
        completed,
        ongoing,
        notStarted,
      };
    });

    // Preparing the response
    const response = {
      totalCourses: user.progress.length,
      coursesProgress,
    };

    res.json(response);
  }),
  // Check if user is authenticated
  checkAuthenticated: asyncHandler(async (req, res) => {
    const token = req.cookies["token"];

    if (!token) {
      return res.status(401).json({ isAuthenticated: false });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).populate({
        path: "coursesCreated",
      });
      if (!user) {
        return res.status(401).json({ isAuthenticated: false });
      }
      return res.status(200).json({ isAuthenticated: true, user: user });
    } catch (error) {
      return res.status(401).json({ isAuthenticated: false, error });
    }
  }),
  logout: asyncHandler(async (req, res) => {
    res.cookie("token", "", { maxAge: 1 });
    res.status(200).json({ message: "Logged out successfully" });
  }),
};

module.exports = usersController;
