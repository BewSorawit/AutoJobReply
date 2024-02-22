const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  fromWhen: String,
  toWhen: String,
  jobPosition: String,
  resumePath: String, // บันทึกที่เก็บที่อัปโหลดไฟล์
  optionalFilePath: String,
});

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;
