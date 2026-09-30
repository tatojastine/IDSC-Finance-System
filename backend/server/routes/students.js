const express = require("express");

const router = express.Router();

const {
  getAllStudents,
  getStudentById
} = require("../services/studentService");

// GET /api/v1/students
router.get("/", (req, res) => {
  const students = getAllStudents();

  res.json(students);
});

// GET /api/v1/students/:studentId
router.get("/:studentId", (req, res) => {
  const student = getStudentById(req.params.studentId);

  if (!student) {
    return res.status(404).type("application/problem+json").json({
      type: "https://example.com/problems/not-found",
      title: "Not Found",
      status: 404,
      detail: "Student not found"
    });
  }

  res.json(student);
});

module.exports = router;