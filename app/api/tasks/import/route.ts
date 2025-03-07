import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const tasks = await request.json();
    
    // Validate tasks array
    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Write to tasks.json
    const tasksFilePath = path.join(process.cwd(), 'public', 'tasks.json');
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));

    return NextResponse.json({ success: true, message: 'Tasks imported successfully' });
  } catch (error) {
    console.error('Error importing tasks:', error);
    return NextResponse.json(
      { error: 'Failed to import tasks' },
      { status: 500 }
    );
  }
} 