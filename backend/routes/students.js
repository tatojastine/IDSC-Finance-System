
const express = require("express");
const router = express.Router();

const {
  getAllStudents,
  getStudentById
} = require("../server/services/studentService");

// GET all students
router.get("/", async (req, res) => {
  try {
    const students = await getAllStudents();

    return res.status(200).json(students);
  } catch (error) {
    console.error("Get all students error:", error);

    return res.status(500).json({
      message: "Failed to fetch students",
      error: error.message
    });
  }
});

// GET student by studentId
router.get("/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const student = await getStudentById(studentId);

    if (!student) {
      return res.status(404).type("application/problem+json").json({
        type: "https://example.com/problems/not-found",
        title: "Not Found",
        status: 404,
        detail: `Student with ID ${studentId} was not found`
      });
    }

    return res.status(200).json(student);
  } catch (error) {
    console.error("Get student by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch student",
      error: error.message
    });
  }
});

module.exports = router;
