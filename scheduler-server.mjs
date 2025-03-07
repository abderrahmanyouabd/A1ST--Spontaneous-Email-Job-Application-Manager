import http from 'http';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to settings file
const settingsFilePath = path.join(__dirname, 'public', 'settings', 'reminderSettings.json');

// Function to read reminder settings
function readReminderSettings() {
  try {
    const data = fs.readFileSync(settingsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading reminder settings:", error);
    return null;
  }
}

// Function to reset reminderSent status for all tasks
async function resetReminderSentStatus() {
  try {
    // Fetch tasks
    console.log('Fetching tasks to reset reminderSent status...');
    const tasksResponse = await fetch('http://localhost:3000/api/tasks');
    const tasks = await tasksResponse.json();
    
    console.log('Current tasks:', JSON.stringify(tasks, null, 2));
    
    // Reset the reminderSent property for each task
    const updatedTasks = tasks.map(task => ({
      ...task,
      reminderSent: false
    }));
    
    console.log('Updated tasks with reset flags:', JSON.stringify(updatedTasks, null, 2));
    
    // Save the updated tasks
    const saveResponse = await fetch('http://localhost:3000/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTasks),
    });
    
    const result = await saveResponse.json();
    console.log('Reset reminderSent status result:', result);
  } catch (error) {
    console.error('Error resetting reminderSent status:', error);
  }
}

// Function to check time and send emails if needed
async function checkTimeAndSendEmails() {
  try {
    // Read current settings
    const settings = readReminderSettings();
    if (!settings || !settings.enabled) {
      console.log('Reminders not enabled, skipping check');
      return;
    }

    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Parse scheduled time
    const [scheduledHour, scheduledMinute] = settings.time.split(':').map(Number);
    
    console.log(`Current time: ${currentHour}:${currentMinute}, Scheduled time: ${scheduledHour}:${scheduledMinute}`);

    // Check if current time matches scheduled time (exactly the same minute)
    if (currentHour === scheduledHour && currentMinute === scheduledMinute) {
      console.log('Time matched! Fetching tasks...');
      
      // Fetch tasks first to check if any are eligible for sending
      const tasksResponse = await fetch('http://localhost:3000/api/tasks');
      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const tasks = await tasksResponse.json();
      console.log('All tasks:', tasks);
      
      // Only proceed if there are tasks that haven't had reminders sent
      const eligibleTasks = tasks.filter(task => 
        !task.reminderSent && 
        !task.completed && 
        task.reminderEnabled &&
        task.recipients && 
        task.recipients.length > 0
      );
      
      console.log('Eligible tasks:', eligibleTasks);
      
      if (eligibleTasks.length === 0) {
        console.log('No eligible tasks found for sending reminders');
        return;
      }
      
      console.log(`Found ${eligibleTasks.length} eligible tasks, sending emails...`);
      
      // Send emails via your API
      const emailResponse = await fetch('http://localhost:3000/api/sendReminderEmails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: eligibleTasks }),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send emails');
      }
      
      const result = await emailResponse.json();
      console.log('Email sending result:', result);
    }
  } catch (error) {
    console.error('Error in email scheduler:', error);
  }
}

// Create a simple HTTP server that does nothing but keeps the process running
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Email scheduler server is running');
});

// Check every minute
setInterval(checkTimeAndSendEmails, 60000);

// Initial check on startup and log current settings
checkTimeAndSendEmails();
const settings = readReminderSettings();
console.log('Current reminder settings:', settings);

// Start server on port 3001 (different from your Next.js app)
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Email scheduler server running on port ${PORT}`);
});

console.log('Email reminder scheduler started. Press Ctrl+C to stop.'); 