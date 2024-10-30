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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // Secured in .env
  },
});

// Async function to send email
const sendEmail = async (mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      resolve(info);
    });
  });
};

app.post("/send", (req, res) => {
  const { name, email, services, comments } = req.body;

  // Send immediate response to the user
  res.status(200).send({ success: true, message: "Your message has been received. We will get back to you soon." });

  // Now, send emails in the background (not blocking the client)
  (async () => {
    try {
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

      // Mail to user
      const mailOptionsToUser = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Thank you for your submission!",
        text: `Hi ${name},\n\nThank you for reaching out to us regarding "${services.join(
      ", "
    )}". We have received your message and will get back to you shortly.\n\nYou can learn more about our SmartTracker product here: https://smarttracker-next.appwizersolutions.com\n\nBest regards,\nAppwizer Team`,
      };

      // Send both emails
      await sendEmail(mailOptionsToAdmin);
      await sendEmail(mailOptionsToUser);
    } catch (error) {
      console.error("Failed to send emails: ", error.message);
      // Optionally, you can log or notify admin in case of email sending failure
    }
  })();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
