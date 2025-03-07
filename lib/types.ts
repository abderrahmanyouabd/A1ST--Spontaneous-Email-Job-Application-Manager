export type Task = {
  id: string;
  title: string;
  description: string;
  companyName: string;
  companyWebsite: string;
  contactPerson: string;
  position: string;
  location: string;
  dueDate: Date | undefined;
  completed: boolean;
  reminderEnabled: boolean;
  recipients: string[];
  reminderSent?: boolean;
}; 