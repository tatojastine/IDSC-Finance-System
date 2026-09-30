const express = require("express");

const router = express.Router();

const {
  getAllAssessments,
  createAssessment,
  getAssessmentsByStudentId
} = require("../services/assessmentService");

// GET /api/v1/assessments
router.get("/", (req, res) => {
  const assessments = getAllAssessments();

  res.json(assessments);
});

// POST /api/v1/assessments
router.post("/", (req, res) => {
  const data = req.body;

  if (!data.studentId || !data.academicYear || !data.semester) {
    return res.status(400).type("application/problem+json").json({
      type: "https://example.com/problems/bad-request",
      title: "Bad Request",
      status: 400,
      detail: "studentId, academicYear, and semester are required"
    });
  }

  const assessment = createAssessment(data);

  res.status(201).json(assessment);
});

// GET /api/v1/assessments/:studentId
router.get("/:studentId", (req, res) => {
  const assessments = getAssessmentsByStudentId(req.params.studentId);

  if (assessments.length === 0) {
    return res.status(404).type("application/problem+json").json({
      type: "https://example.com/problems/not-found",
      title: "Not Found",
      status: 404,
      detail: "No assessments found for this student"
    });
  }

  res.json(assessments);
});

module.exports = router;