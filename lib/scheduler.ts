import cron from 'node-cron';
import { sendReminderEmails } from './actions'; // Import your email sending function
import { fetchTasks } from './actions'; // Import the fetchTasks function

// Schedule a job to run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  const tasks = await fetchTasks(); // Fetch tasks from your data source
  await sendReminderEmails(tasks); // Send emails for tasks that need reminders
});
