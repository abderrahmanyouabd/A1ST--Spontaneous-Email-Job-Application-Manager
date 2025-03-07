import cron from 'node-cron';
import { sendReminderEmails, fetchTasks, resetReminderStatus } from './actions'; // Ensure these paths are correct

// Schedule a task to run every day at a specific time
const scheduleEmailReminders = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  
  // Schedule the task
  cron.schedule(`0 ${minute} ${hour} * * *`, async () => {
    console.log(`Scheduler triggered at ${new Date().toLocaleString()}`);
    const tasks = await fetchTasks();
    console.log(`Fetched tasks: ${JSON.stringify(tasks)}`); // Log fetched tasks
    await sendReminderEmails(tasks);
    resetReminderStatus(tasks); // Reset the status after sending emails
  });
};

export default scheduleEmailReminders;
