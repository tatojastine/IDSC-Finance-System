const express = require("express");
const router = express.Router();

const Student = require("../models/Student");

// GET all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message
    });
  }
});

// GET one student
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student",
      error: error.message
    });
  }
});

// CREATE student
router.post("/", async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      program,
      academicYear,
      semester,
      accountStatus
    } = req.body;

    if (
      !studentId ||
      !studentName ||
      !program ||
      !academicYear ||
      !semester
    ) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    const existingStudent = await Student.findOne({ studentId });

    if (existingStudent) {
      return res.status(409).json({
        message: "Student ID already exists"
      });
    }

    const student = new Student({
      studentId,
      studentName,
      program,
      academicYear,
      semester,
      accountStatus
    });

    const savedStudent = await student.save();

    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create student",
      error: error.message
    });
  }
});

// UPDATE student
router.put("/:id", async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      program,
      academicYear,
      semester,
      accountStatus
    } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        studentId,
        studentName,
        program,
        academicYear,
        semester,
        accountStatus
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update student",
      error: error.message
    });
  }
});

// DELETE student
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student",
      error: error.message
    });
  }
});

module.exports = router;