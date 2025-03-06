export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date | undefined;
  completed: boolean;
  reminderEnabled: boolean;
  recipients: string[];
}; 