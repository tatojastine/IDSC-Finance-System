const assessments = require("../data/assessments");

function getAllAssessments() {
  return assessments;
}

function createAssessment(data) {
  const newAssessment = {
    id: `ASM-2026-${String(assessments.length + 1).padStart(3, "0")}`,
    ...data
  };

  assessments.push(newAssessment);

  return newAssessment;
}

function getAssessmentsByStudentId(studentId) {
  return assessments.filter(
    (assessment) => assessment.studentId === studentId
  );
}

module.exports = {
  getAllAssessments,
  createAssessment,
  getAssessmentsByStudentId
};