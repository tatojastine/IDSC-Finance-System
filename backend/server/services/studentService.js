
const Student = require("../../models/Student");

async function getAllStudents() {
  return await Student.find().sort({ createdAt: -1 }).lean();
}

async function getStudentById(studentId) {
  console.log("Searching for studentId:", studentId);

  const student = await Student.findOne({
    studentId: String(studentId).trim()
  }).lean();

  console.log("Student found:", student);

  return student;
}

module.exports = {
  getAllStudents,
  getStudentById
};
