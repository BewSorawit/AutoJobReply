const express = require("express");
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const Applicant = require("../models/Applicant");

// Multer configuration for file upload
const storage = multer.memoryStorage();

const cvDestination = (req, file, cb) => {
  const userId = req.body.email.replace("@", "_").replace(".", "_");
  const userDir = path.join(__dirname, `../public/users/${userId}`);

  // Create the user directory and its parent directories if they don't exist
  fs.mkdirSync(userDir, { recursive: true });

  cb(null, userDir);
};

const upload = multer({
  storage: multer.diskStorage({
    destination: cvDestination,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  }),
});

// Define a route for the root path
router.get("/", (req, res) => {
  res.render("index.ejs");
});
// Change this route to handle the application form page
router.get("/application-form", (req, res) => {
  res.render("applicationForm");
});

// Express route for handling form submission
router.post(
  "/submit-application",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "optionalFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Save applicant data to MongoDB
      const {
        name,
        lastName,
        email,
        phoneNumber,
        fromWhen,
        toWhen,
        jobPosition,
      } = req.body;
      const resumeFile = req.files["resume"] ? req.files["resume"][0] : null;
      const optionalFile = req.files["optionalFile"]
        ? req.files["optionalFile"][0]
        : null;

      if (!resumeFile) {
        console.error("No resume file provided");
        res.status(400).send("Bad Request: No resume file provided");
        return;
      }

      const userId = email.replace("@", "_").replace(".", "_");
      const userDir = path.join(__dirname, `../public/users/${userId}`);
      const resumePath = path.join(userDir, resumeFile.filename);

      const applicant = new Applicant({
        name,
        lastName,
        email,
        phoneNumber,
        fromWhen,
        toWhen,
        jobPosition,
        resumePath: resumePath,
        optionalFilePath: optionalFile
          ? path.join(userDir, optionalFile.filename)
          : null,
      });

      await applicant.save();

      // Move the uploaded files to the user's directory
      fs.renameSync(resumeFile.path, resumePath);
      if (optionalFile) {
        fs.renameSync(
          optionalFile.path,
          path.join(userDir, optionalFile.filename)
        );
      }

      // Send confirmation email to the applicant
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "schueachuai@gmail.com",
          pass: "cfjj xfre zvrn fplm",
        },
      });

      const mailOptions = {
        from: "schueachuai@gmail.com",
        to: req.body.email,
        subject: "Application Received",
        text: "Thank you for submitting your application. We will review it shortly.",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Email sent: " + info.response);
          // Redirect to the success page after sending email and saving data
          res.redirect("/success-page");
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
