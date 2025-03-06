import nodemailer from 'nodemailer';
// Remove the import statement for Task type to avoid conflict with local declaration

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date | undefined;
  completed: boolean;
  reminderEnabled: boolean;
  recipients: string[];
};

// 🔹 Mock tasks
const tasks: Task[] = [
  {
    id: "1",
    title: "Complete project proposal",
    description: "Finish the Q3 project proposal for client review",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
    completed: false,
    reminderEnabled: true,
    recipients: ["youabd50@gmail.com"],
  },
  {
    id: "2",
    title: "Weekly team meeting",
    description: "Prepare agenda for the weekly team sync",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Due in 1 day
    completed: true,
    reminderEnabled: true,
    recipients: ["manager@example.com"],
  },
];

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
  const pendingTasks = tasks.filter((task) => !task.completed && task.reminderEnabled);
  const completedTasks = tasks.filter((task) => task.completed && task.reminderEnabled);

  for (const task of pendingTasks) {
    const emailContent = generateTaskReminderEmail(task);
    try {
      await transporter.sendMail(emailContent);
      console.log(`✅ Reminder email sent for task: ${task.title}`);
    } catch (error) {
      console.error(`❌ Failed to send email for task: ${task.title}`, error);
    }
  }

  if (pendingTasks.length > 0 || completedTasks.length > 0) {
    const summaryEmailContent = generateDailySummaryEmail(pendingTasks, completedTasks);
    try {
      await transporter.sendMail(summaryEmailContent);
      console.log(`✅ Daily summary email sent.`);
    } catch (error) {
      console.error("❌ Failed to send daily summary email", error);
    }
  }

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

  return {
    from: '"Task Reminder System" <youabd50@gmail.com>',
    to: task.recipients.join(", "),
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

  return {
    from: '"Task Reminder System" <youabd50@gmail.com>',
    to: tasks.flatMap((task) => task.recipients),
    subject,
    text,
  };
}

// Mock function to fetch tasks
export async function fetchTasks() {
  const tasks = [
    {
      id: "1",
      title: "Complete project proposal",
      description: "Finish the Q3 project proposal for client review",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      completed: false,
      reminderEnabled: true,
      recipients: ["youabd50@gmail.com"],
    },
    {
      id: "2",
      title: "Weekly team meeting",
      description: "Prepare agenda for the weekly team sync",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      completed: true,
      reminderEnabled: true,
      recipients: ["manager@example.com"],
    },
  ];

  // Convert dueDate to Date object if it exists
  tasks.forEach(task => {
    if (typeof task.dueDate === 'string') {
      task.dueDate = new Date(task.dueDate);
    }
  });

  return tasks;
}