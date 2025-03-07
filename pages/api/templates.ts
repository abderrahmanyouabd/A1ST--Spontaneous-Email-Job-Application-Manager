import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const templatesFilePath = path.join(process.cwd(), 'public', 'templates.json');

// Function to read templates from templates.json
const readTemplates = () => {
  try {
    if (fs.existsSync(templatesFilePath)) {
      const data = fs.readFileSync(templatesFilePath, 'utf8');
      return JSON.parse(data);
    }
    return { subject: "", body: "" };
  } catch (error) {
    console.error("Error reading templates:", error);
    return { subject: "", body: "" };
  }
};

// Function to save templates to templates.json
const saveTemplates = (templates: any) => {
  // Create directory if it doesn't exist
  const dir = path.dirname(templatesFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(templatesFilePath, JSON.stringify(templates, null, 2));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const templates = readTemplates();
    res.status(200).json(templates);
  } else if (req.method === 'POST') {
    try {
      const templates = req.body;
      saveTemplates(templates);
      res.status(200).json({ success: true, message: "Templates saved successfully" });
    } catch (error) {
      console.error("Error saving templates:", error);
      res.status(500).json({ success: false, message: "Failed to save templates" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 