import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv') as File;
    const taskId = formData.get('taskId') as string;

    if (!file || !taskId) {
      return NextResponse.json(
        { error: 'Missing file or task ID' },
        { status: 400 }
      );
    }

    // Create filename using your name format
    const filename = `Abderrahman_Youabd_cv_${taskId}.pdf`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Delete existing CV file for this task if it exists
    try {
      const tasks = JSON.parse(await fs.promises.readFile(path.join(process.cwd(), 'public', 'tasks.json'), 'utf8'));
      const task = tasks.find((t: any) => t.id === taskId);
      if (task?.cvPath) {
        const oldFilePath = path.join(process.cwd(), 'public', task.cvPath);
        await fs.promises.unlink(oldFilePath).catch(() => {});
      }
    } catch (error) {
      console.error('Error deleting old CV:', error);
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    // Write new file
    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      filePath: `/uploads/${filename}` 
    });
  } catch (error) {
    console.error('Error uploading CV:', error);
    return NextResponse.json(
      { error: 'Failed to upload CV' },
      { status: 500 }
    );
  }
} 