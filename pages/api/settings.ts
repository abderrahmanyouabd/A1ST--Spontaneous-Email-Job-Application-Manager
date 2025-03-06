import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'public', 'settings', 'reminderSettings.json');

// Default settings
const defaultSettings = {
  enabled: true,
  frequency: "daily",
  time: "09:00",
  sendToTaskOwner: true,
  ccManagers: false,
  sendCompletedSummary: true,
  sendPendingSummary: true,
  recipients: [],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Read settings
    try {
      if (!fs.existsSync(settingsFilePath)) {
        // If the file doesn't exist, create it with default settings
        fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2));
      }
      const data = fs.readFileSync(settingsFilePath, 'utf8');
      if (!data) {
        // If the file is empty, return default settings
        return res.status(200).json(defaultSettings);
      }
      res.status(200).json(JSON.parse(data));
    } catch (error) {
      console.error("Error reading settings:", error);
      res.status(500).json({ message: "Error reading settings" });
    }
  } else if (req.method === 'POST') {
    // Write settings
    try {
      fs.writeFileSync(settingsFilePath, JSON.stringify(req.body, null, 2));
      res.status(200).json({ message: "Settings saved successfully" });
    } catch (error) {
      console.error("Error writing settings:", error);
      res.status(500).json({ message: "Error writing settings" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 