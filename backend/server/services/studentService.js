const students = require("../data/students");

function getAllStudents() {
  return students;
}

function getStudentById(studentId) {
  return students.find((student) => student.studentId === studentId);
}

module.exports = {
  getAllStudents,
  getStudentById
};