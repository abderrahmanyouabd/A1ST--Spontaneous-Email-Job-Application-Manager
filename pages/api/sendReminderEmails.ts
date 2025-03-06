import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { Task } from "@/lib/types"; // Import Task type
import { sendReminderEmails } from '@/lib/actions'; // Ensure this path is correct

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "youabd50@gmail.com", // Replace with your Gmail address
    pass: "vqeu nhck srqx cqcq", // Replace with your generated App Password
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { tasks } = req.body; // Expecting tasks to be sent in the request body

    // Ensure dueDate is a Date object and recipients is an array
    tasks.forEach((task: Task) => {
      if (typeof task.dueDate === 'string') {
        task.dueDate = new Date(task.dueDate);
      }
      if (!task.recipients) {
        task.recipients = []; // Initialize recipients as an empty array if undefined
      }
    });

    try {
      await sendReminderEmails(tasks); // Ensure tasks is an array of Task
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
function generateTaskReminderEmail(task: Task) {
  const isOverdue = task.dueDate && task.dueDate < new Date();
  const subject = isOverdue ? `🚨 OVERDUE: ${task.title}` : `📌 Task Due Soon: ${task.title}`;

  const text = `Hello,

${isOverdue ? "The following task is now OVERDUE:" : "This is a reminder about your upcoming task:"}

Task: ${task.title}
Description: ${task.description}
Due Date: ${task.dueDate ? task.dueDate.toLocaleDateString() : "No due date"}
${isOverdue ? "⚠️ Please complete this task as soon as possible." : "✅ Please ensure this task is completed on time."}

Thank you,
Task Reminder System`;

  return {
    from: '"Task Reminder System" <youabd50@gmail.com>',
    to: task.recipients.join(", "),
    subject,
    text,
  };
}