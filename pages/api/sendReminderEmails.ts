import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "youabd50@gmail.com", // Replace with your Gmail address
    pass: "", // Replace with your generated App Password
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { tasks } = req.body; // Expecting tasks to be sent in the request body

    try {
      // Logic to send emails based on tasks
      for (const task of tasks) {
        const emailContent = generateTaskReminderEmail(task);
        await transporter.sendMail(emailContent);
      }
      res.status(200).json({ success: true, message: "Emails sent successfully" });
    } catch (error) {
      console.error("Error sending emails:", error);
      res.status(500).json({ success: false, message: "Failed to send emails" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// 🔹 Generate task reminder email
function generateTaskReminderEmail(task: any) {
  const subject = `Reminder: ${task.title}`;
  const text = `This is a reminder for your task: ${task.title}`;
  
  return {
    from: '"Task Reminder System" <youabd50@gmail.com>',
    to: "youabd50@gmail.com", // Replace with the recipient's email
    subject,
    text,
  };
} 