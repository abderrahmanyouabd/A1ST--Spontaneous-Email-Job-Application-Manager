import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { Task } from './types';
import { generateJobInquiryEmail } from './emailTemplates';
import { readReminderSettings } from './settings';

const tasksFilePath = path.join(process.cwd(), 'public', 'tasks.json');

// Function to read tasks from tasks.json
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
};

// Function to save tasks to tasks.json
export const saveTasks = (tasks: Task[]) => {
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};

// 🔹 Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "youabd50@gmail.com", // Replace with your Gmail address
    pass: "vqeu nhck srqx cqcq", // Replace with your generated App Password
  },
});

// Reset reminder status for all tasks
export const resetReminderStatus = (tasks: Task[]) => {
  const updatedTasks = tasks.map(task => ({
    ...task,
    reminderSent: false
  }));
  
  saveTasks(updatedTasks);
  console.log("Reset reminderSent status for all tasks");
};

// Send job inquiry emails
export async function sendReminderEmails(tasks: Task[]) {
  // Get settings to access attachment configurations
  const settings = readReminderSettings();
  
  const pendingTasks = tasks.filter((task) => 
    !task.completed && 
    task.reminderEnabled && 
    task.recipients && 
    task.recipients.length > 0
  );
  console.log(`Pending tasks to send emails for: ${JSON.stringify(pendingTasks)}`);

  for (const task of pendingTasks) {
    const { subject, body } = generateJobInquiryEmail(task);
    
    try {
      // Convert attachment configs to nodemailer format
      const attachments = settings.attachments.map((attachment: { name: string; path: string }) => ({
        filename: attachment.name,
        path: path.join(process.cwd(), 'public', attachment.path)
      }));

      await transporter.sendMail({
        from: "youabd50@gmail.com",
        to: task.recipients.join(", "),
        subject: subject,
        text: body,
        attachments: attachments
      });
      
      console.log(`✅ Job inquiry email sent to ${task.companyName} with ${attachments.length} attachments`);
      
      // Update task status after successful email send
      const allTasks = await fetchTasks();
      const updatedTasks = allTasks.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            completed: true,
            reminderEnabled: false,
            reminderSent: true
          };
        }
        return t;
      });
      
      // Save all tasks with the updated status
      saveTasks(updatedTasks);
      console.log(`✅ Updated status for task: ${task.title}`);
      
    } catch (error) {
      console.error(`❌ Failed to send email to ${task.companyName}`, error);
    }
  }

  return { success: true, message: "Job inquiry emails sent successfully" };
}

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