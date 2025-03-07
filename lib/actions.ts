import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { readReminderSettings } from './settings'; // Import the function to read settings

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date | undefined;
  completed: boolean;
  reminderEnabled: boolean;
  recipients: string[];
  reminderSent?: boolean;
};

// 🔹 Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "youabd50@gmail.com", // 🔹 Replace with your Gmail address
    pass: "vqeu nhck srqx cqcq",   // 🔹 Replace with your generated App Password
  },
});

// 🔹 Function to send reminder emails
export async function sendReminderEmails(tasks: Task[]) {
  const pendingTasks = tasks.filter((task) => !task.completed && task.reminderEnabled && !task.reminderSent);
  console.log(`Pending tasks to send emails for: ${JSON.stringify(pendingTasks)}`); // Log pending tasks
  const completedTasks = tasks.filter((task) => task.completed && task.reminderEnabled);

  for (const task of pendingTasks) {
    const emailContent = generateTaskReminderEmail(task);
    try {
      await transporter.sendMail(emailContent);
      console.log(`✅ Reminder email sent for task: ${task.title}`);
      task.reminderSent = true; // Mark the task as having had a reminder sent
    } catch (error) {
      console.error(`❌ Failed to send email for task: ${task.title}`, error);
    }
  }

  // Save the updated tasks to reflect the reminderSent status
  saveTasks(tasks);

  if (pendingTasks.length > 0 || completedTasks.length > 0) {
    const summaryEmailContent = generateDailySummaryEmail(pendingTasks, completedTasks);
    try {
      await transporter.sendMail(summaryEmailContent);
      console.log(`✅ Daily summary email sent.`);
    } catch (error) {
      console.error("❌ Failed to send daily summary email", error);
    }
  }

  // Reset the reminderSent flag after 30 seconds
  setTimeout(() => {
    console.log("Resetting reminderSent status from within sendReminderEmails");
    tasks.forEach(task => {
      task.reminderSent = false;
    });
    saveTasks(tasks);
  }, 30000);

  return { success: true, message: "Reminder emails sent successfully" };
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

// Fetch recipients from reminder settings
const settings = readReminderSettings();
const recipients = settings ? settings.recipients.map((recipient: { email: string }) => recipient.email) : [];

return {
  from: '"Task Reminder System" <youabd50@gmail.com>',
  to: recipients.join(", "), // Use recipients from reminder settings
  subject,
  text,
};
}

// 🔹 Generate daily summary email
function generateDailySummaryEmail(pendingTasks: Task[], completedTasks: Task[]) {
  const today = new Date().toLocaleDateString();
  const pendingTasksList = pendingTasks
    .map((task) => `- ${task.title} (Due: ${task.dueDate ? task.dueDate.toLocaleDateString() : "No due date"})`)
    .join("\n");
  const completedTasksList = completedTasks.map((task) => `- ${task.title}`).join("\n");

  const subject = `📅 Daily Task Summary - ${today}`;
  const text = `Hello,

Here is your daily task summary for ${today}:

${completedTasks.length > 0 ? `✅ COMPLETED TASKS:\n${completedTasksList}\n\n` : ""}
${pendingTasks.length > 0 ? `📌 PENDING TASKS:\n${pendingTasksList}\n\n` : ""}

Thank you,
Task Reminder System`;

  // Fetch recipients from reminder settings
  const settings = readReminderSettings();
  const recipients = settings ? settings.recipients.map((recipient: { email: string }) => recipient.email) : [];

  return {
    from: '"Task Reminder System" <youabd50@gmail.com>',
    to: recipients.join(", "), // Use recipients from reminder settings
    subject,
    text,
  };
}

// Function to fetch tasks from tasks.json
export async function fetchTasks(): Promise<Task[]> {
  const tasksFilePath = path.join(process.cwd(), 'public', 'tasks.json');
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf8');
    const tasks: Task[] = JSON.parse(data);
    // Convert dueDate to Date object
    tasks.forEach(task => {
      if (typeof task.dueDate === 'string') {
        task.dueDate = new Date(task.dueDate);
      }
    });
    return tasks;
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
}

// Function to save tasks to tasks.json
const saveTasks = (tasks: Task[]) => {
  const tasksFilePath = path.join(process.cwd(), 'public', 'tasks.json');
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};

// Function to add a new task
export const addTask = async (newTask: Task) => {
  const tasks = await fetchTasks();
  tasks.push(newTask);
  saveTasks(tasks);
};

// Function to update an existing task
export const updateTask = async (updatedTask: Task) => {
  const tasks = await fetchTasks();
  const taskIndex = tasks.findIndex((task: Task) => task.id === updatedTask.id);
  if (taskIndex !== -1) {
    tasks[taskIndex] = updatedTask;
    saveTasks(tasks);
  }
};

// Function to delete a task
export const deleteTask = async (taskId: string) => {
  const tasks = await fetchTasks();
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  saveTasks(updatedTasks);
};

// Function to reset reminder status
export const resetReminderStatus = (tasks: Task[]) => {
  // Reset the reminderSent status immediately
  tasks.forEach(task => {
    task.reminderSent = false; // Reset the reminderSent status
  });
  saveTasks(tasks); // Save the updated tasks

  // Set a timeout to reset the reminderSent status after 1 minute
  setTimeout(() => {
    tasks.forEach(task => {
      task.reminderSent = false; // Reset the reminderSent status again after 1 minute
    });
    saveTasks(tasks); // Save the updated tasks again
    console.log("Reminder status reset after 1 minute.");
  }, 500); // 60000 milliseconds = 1 minute
};