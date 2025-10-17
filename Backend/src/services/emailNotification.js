//This is for sending email notifications for tasks that are due in 2 days.

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const password = process.env.EMAIL_PASSWORD;
const email = process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: password,
  },
});

const sendEmailNotification = async (userEmail, task) => {
  try {
    const mailOptions = {
      from: email,
      to: userEmail,
      subject: `Reminder: Task "${task.title} is due soon!`,
      html: `
        <h2>Task Reminder</h2>
        <p>Your task "<strong>${task.title}</strong>" is due soon!</p>
        <p><strong>Course:</strong> ${task.course}</p>
        <p><strong>Due Date:</strong> ${task.dueDate}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        `,
    };
    const result = await transporter.sendMail(mailOptions);
    console.log(
      `Email sent to ${userEmail} for task "${task.title}"`,
      result.messageId
    );
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(
      `Error sending email to ${userEmail} for task "${task.title}":`,
      error
    );
    return { success: false, error: error.message };
  }
};

export default sendEmailNotification;
