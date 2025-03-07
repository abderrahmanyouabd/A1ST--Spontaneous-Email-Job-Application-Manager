import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { Task } from "@/lib/types"; // Import Task type
import { sendReminderEmails } from '@/lib/actions'; // Ensure this path is correct
import { readReminderSettings } from '@/lib/settings';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "youabd50@gmail.com", // Replace with your Gmail address
    pass: "vqeu nhck srqx cqcq", // Replace with your generated App Password
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { tasks } = req.body;

    // Process tasks
    tasks.forEach((task: Task) => {
      if (typeof task.dueDate === 'string') {
        task.dueDate = new Date(task.dueDate);
      }
      if (!task.recipients) {
        task.recipients = [];
      }
    });

    try {
      await sendReminderEmails(tasks);
      console.log("Emails sent successfully");
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