const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 2222;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/send", (req, res) => {
  const { name, email, services, comments } = req.body;

  if (!name || !email || !services || !comments) {
    return res.status(400).send({
      success: false,
      message: "All fields (name, email, services, and comments) are required.",
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS, // Store password securely in environment variables
    },
  });

  // Mail to admin
  const mailOptionsToAdmin = {
    from: process.env.GMAIL_USER,
    to: "pratiksha.patil@appwizersolutions.com", // Admin email
    subject: "New Contact Us Form Submission",
    text: `
      You have received a new submission from the Contact Us form on Appwizer.

      Details of the submission:

      Name: ${name}
      Email: ${email}
      Service Interested In: ${services.join(", ")}
      Remark/Message: ${comments}

      Please follow up with the user at: ${email}.
    `,
    replyTo: email,
  };

  // Mail to the user who submitted the form
  const mailOptionsToUser = {
    from: process.env.GMAIL_USER,
    to: email, // Send back to the user
    subject: "Thank you for your submission!",
    text: `Hi ${name},\n\nThank you for reaching out to us regarding "${services.join(
      ", "
    )}". We have received your message and will get back to you shortly.\n\nYou can learn more about our SmartTracker product here: https://smarttracker-next.appwizersolutions.com\n\nBest regards,\nAppwizer Team`,
  };

  // Send email to admin
  transporter.sendMail(mailOptionsToAdmin, (error, info) => {
    if (error) {
      console.error("Error sending email to admin: ", error);
      return res.status(500).send({
        success: false,
        message: "Failed to send email to admin: " + error.message,
      });
    }

    // If the admin email is sent successfully, send email to the user
    transporter.sendMail(mailOptionsToUser, (error, info) => {
      if (error) {
        console.error("Error sending confirmation email to user: ", error);
        return res.status(500).send({
          success: false,
          message:
            "Admin email sent but failed to send confirmation to user: " +
            error.message,
        });
      }

      res.send({ success: true, message: "Emails sent successfully!" });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
