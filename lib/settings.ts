import fs from 'fs';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'public', 'settings', 'reminderSettings.json');

// Function to read reminder settings
export const readReminderSettings = () => {
  try {
    const data = fs.readFileSync(settingsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading reminder settings:", error);
    return null; // Return null or default settings if there's an error
  }
};

export const writeSettings = (settings: any) => {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
    console.log("Settings saved successfully.");
  } catch (error) {
    console.error("Error writing settings:", error);
  }
}; 