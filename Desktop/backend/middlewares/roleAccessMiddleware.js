// Role checking functions
const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).send("Access Denied: Admins only.");
    }
    next();
  };
  
  const isInstructor = (req, res, next) => {
    if (req.user.role !== "instructor") {
      return res.status(403).send("Access Denied: Instructors only.");
    }
    next();
  };
  
  const isStudent = (req, res, next) => {
    if (req.user.role !== "student") {
      return res.status(403).send("Access Denied: Students only.");
    }
    next();
  };
  
  // Export the combined middleware
  module.exports = {
    isAdmin,
    isInstructor,
    isStudent,
  };
  