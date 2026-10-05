const express = require("express");
const router = express.Router();

const Assessment = require("../models/Assessment");

// GET all assessments
router.get("/", async (req, res) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 });

    res.json(assessments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch assessments",
      error: error.message
    });
  }
});

// GET assessments by student ID
router.get("/student/:studentId", async (req, res) => {
  try {
    const assessments = await Assessment.find({
      studentId: req.params.studentId
    }).sort({ createdAt: -1 });

    res.json(assessments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student assessments",
      error: error.message
    });
  }
});

// GET one assessment
router.get("/:id", async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        message: "Assessment not found"
      });
    }

    res.json(assessment);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch assessment",
      error: error.message
    });
  }
});

// CREATE assessment
router.post("/", async (req, res) => {
  try {
    const {
      studentId,
      academicYear,
      semester,
      tuitionFee,
      miscellaneousFee,
      laboratoryFee,
      registrationFee,
      libraryFee,
      otherFees,
      discounts,
      scholarshipFinancialAssistance,
      dueDate,
      assessmentStatus
    } = req.body;

    if (!studentId || !academicYear || !semester || !dueDate) {
      return res.status(400).json({
        message: "Student ID, academic year, semester, and due date are required"
      });
    }

    const assessment = new Assessment({
      studentId,
      academicYear,
      semester,
      tuitionFee,
      miscellaneousFee,
      laboratoryFee,
      registrationFee,
      libraryFee,
      otherFees,
      discounts,
      scholarshipFinancialAssistance,
      dueDate,
      assessmentStatus
    });

    const savedAssessment = await assessment.save();

    res.status(201).json(savedAssessment);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create assessment",
      error: error.message
    });
  }
});

// UPDATE assessment
router.put("/:id", async (req, res) => {
  try {
    const {
      studentId,
      academicYear,
      semester,
      tuitionFee,
      miscellaneousFee,
      laboratoryFee,
      registrationFee,
      libraryFee,
      otherFees,
      discounts,
      scholarshipFinancialAssistance,
      dueDate,
      assessmentStatus
    } = req.body;

    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        message: "Assessment not found"
      });
    }

    assessment.studentId = studentId;
    assessment.academicYear = academicYear;
    assessment.semester = semester;
    assessment.tuitionFee = tuitionFee;
    assessment.miscellaneousFee = miscellaneousFee;
    assessment.laboratoryFee = laboratoryFee;
    assessment.registrationFee = registrationFee;
    assessment.libraryFee = libraryFee;
    assessment.otherFees = otherFees;
    assessment.discounts = discounts;
    assessment.scholarshipFinancialAssistance =
      scholarshipFinancialAssistance;
    assessment.dueDate = dueDate;
    assessment.assessmentStatus = assessmentStatus;

    const updatedAssessment = await assessment.save();

    res.json(updatedAssessment);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update assessment",
      error: error.message
    });
  }
});

// DELETE assessment
router.delete("/:id", async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        message: "Assessment not found"
      });
    }

    res.json({
      message: "Assessment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete assessment",
      error: error.message
    });
  }
});

module.exports = router;