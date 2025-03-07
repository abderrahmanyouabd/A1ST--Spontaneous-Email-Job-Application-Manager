import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Task } from "@/lib/types";
import { deleteTask } from '@/lib/actions';

const tasksFilePath = path.join(process.cwd(), 'public', 'tasks.json') as string;

// Function to read tasks from tasks.json
const readTasks = () => {
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
};

// Function to save tasks to tasks.json
const saveTasks = (tasks: Task[]) => {
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const tasks = readTasks();
    res.status(200).json(tasks);
  } else if (req.method === 'POST') {
    const newTask: Task = req.body;
    const tasks = readTasks();
    tasks.push(newTask);
    saveTasks(tasks);
    res.status(201).json(newTask);
  } else if (req.method === 'PUT') {
    // New method to update all tasks at once
    const updatedTasks: Task[] = req.body;
    
    // Ensure dates are properly converted
    updatedTasks.forEach(task => {
      if (typeof task.dueDate === 'string') {
        task.dueDate = new Date(task.dueDate);
      }
    });
    
    saveTasks(updatedTasks);
    res.status(200).json({ success: true, message: "All tasks updated successfully" });
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    
    // Use the deleteTask function to ensure CV files are also deleted
    try {
      deleteTask(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
