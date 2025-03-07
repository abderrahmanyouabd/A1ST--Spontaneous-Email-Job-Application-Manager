const http = require('http');
const fs = require('fs');
const path = require('path');
// No need to import fetch as it's built-in from Node.js 18+

// Path to settings file
const settingsFilePath = path.join(process.cwd(), 'public', 'settings', 'reminderSettings.json');

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
    
    // Check if current time matches scheduled time (exactly the same minute)
    if (currentHour === scheduledHour && currentMinute === scheduledMinute) {
      console.log(`Time matched (${currentHour}:${currentMinute})! Sending scheduled emails...`);
      
      // Fetch tasks from your API
      const tasksResponse = await fetch('http://localhost:3000/api/tasks');
      const tasks = await tasksResponse.json();
      
      // Send emails via your API
      const emailResponse = await fetch('http://localhost:3000/api/sendReminderEmails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
      });
      
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

// Initial check on startup
checkTimeAndSendEmails();

// Start server on port 3001 (different from your Next.js app)
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Email scheduler server running on port ${PORT}`);
});

console.log('Email reminder scheduler started. Press Ctrl+C to stop.');