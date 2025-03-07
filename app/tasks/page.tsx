"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, ChevronLeft, Mail, PlusCircle, Trash2, Loader2, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { addTask, fetchTasks, deleteTask } from "@/lib/actions"
import { Task } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    companyName: "",
    companyWebsite: "",
    contactPerson: "",
    position: "",
    location: "",
    dueDate: undefined,
    completed: false,
    reminderEnabled: true,
    recipients: [],
  })

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isSending, setIsSending] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      setTasks(data)
    }

    fetchTasks()
  }, [])

  const addTask = async () => {
    if (!newTask.title || !newTask.companyName || !newTask.recipients || newTask.recipients.length === 0) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || "",
      companyName: newTask.companyName || "",
      companyWebsite: newTask.companyWebsite || "",
      contactPerson: newTask.contactPerson || "",
      position: newTask.position || "",
      location: newTask.location || "",
      dueDate: newTask.dueDate,
      completed: false,
      reminderEnabled: newTask.reminderEnabled || false,
      recipients: newTask.recipients || [],
    }

    await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })

    setNewTask({
      title: "",
      description: "",
      companyName: "",
      companyWebsite: "",
      contactPerson: "",
      position: "",
      location: "",
      dueDate: undefined,
      completed: false,
      reminderEnabled: true,
      recipients: [],
    })

    // Refresh the task list
    const response = await fetch('/api/tasks')
    const data = await response.json()
    setTasks(data)
  }

  const deleteTask = async (taskId: string) => {
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: taskId }),
    })

    // Refresh the task list
    const response = await fetch('/api/tasks')
    const data = await response.json()
    setTasks(data)
  }

  // Toggle task completion status
  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, completed: completed } : task))
    setTasks(updatedTasks)
    
    // Save to server
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTasks),
      });
    } catch (error) {
      console.error('Error updating task completion:', error);
    }
  }

  // Toggle reminder setting for a task
  const toggleReminderEnabled = async (taskId: string, enabled: boolean) => {
    // Find the task to update
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, reminderEnabled: enabled };
      }
      return task;
    });
    
    // Update state
    setTasks(updatedTasks);
    
    // Save to server
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTasks),
      });
      console.log(`Reminder ${enabled ? 'enabled' : 'disabled'} for task ${taskId}`);
    } catch (error) {
      console.error('Error updating task reminder setting:', error);
    }
  }

  // Filter tasks by completion status
  const pendingTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  const handleSendAllPendingEmails = async () => {
    setIsSending(true)
    try {
      // Debug logging
      console.log('All tasks:', tasks);
      
      // Get all eligible tasks (not completed, reminder enabled, has recipients)
      const eligibleTasks = tasks.filter(task => {
        const isEligible = 
          !task.completed && 
          task.reminderEnabled && 
          task.recipients && 
          task.recipients.length > 0;
        
        // Debug logging for each task
        console.log(`Task ${task.title}:`, {
          completed: !task.completed,
          reminderEnabled: task.reminderEnabled,
          hasRecipients: task.recipients && task.recipients.length > 0,
          isEligible
        });
        
        return isEligible;
      });

      console.log('Eligible tasks:', eligibleTasks);

      if (eligibleTasks.length === 0) {
        toast({
          title: "No eligible tasks",
          description: "There are no pending tasks eligible for sending emails.",
          variant: "default"
        });
        setIsSending(false);
        return;
      }

      // Show starting toast
      toast({
        title: "Starting email process",
        description: `Preparing to send ${eligibleTasks.length} emails...`,
      });

      const response = await fetch('/api/sendReminderEmails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: eligibleTasks }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      const result = await response.json();
      
      // Show progress toast
      toast({
        title: "Emails sent",
        description: "Updating task statuses...",
      });
      
      // Refresh tasks list to show updated status
      const updatedTasksResponse = await fetch('/api/tasks');
      const updatedTasks = await updatedTasksResponse.json();
      setTasks(updatedTasks);

      // Final success toast
      toast({
        title: "Success",
        description: `✅ Sent ${eligibleTasks.length} emails successfully. Tasks have been moved to completed.`,
        action: <ToastAction altText="OK">OK</ToastAction>,
      });
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Error",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setIsSending(false);
    }
  };

  // Function to handle task updates
  const updateTask = async (updatedTask: Task) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );

      await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTasks),
      });

      setTasks(updatedTasks);
      setEditingTask(null);
      
      toast({
        title: "Task Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex items-center p-4 border-b">
        <Link href="/" className="flex items-center text-sm font-medium mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Link>
        <h1 className="text-xl font-bold">Job Application Manager</h1>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4">
        <div className="md:w-2/3">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pending Applications
                {pendingTasks.length > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {pendingTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedTasks.length > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {completedTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="border rounded-md mt-2">
              {pendingTasks.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No pending applications</div>
              ) : (
                pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-4 flex-1">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={(checked) => toggleTaskCompletion(task.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {task.companyName} • {task.location}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`reminder-${task.id}`}
                            checked={task.reminderEnabled}
                            onCheckedChange={(checked) => toggleReminderEnabled(task.id, checked as boolean)}
                          />
                          <Label htmlFor={`reminder-${task.id}`} className="text-xs">
                            Send email
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setEditingTask(task)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Application</DialogTitle>
                              </DialogHeader>
                              {editingTask && (
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-title">Application Title</Label>
                                    <Input
                                      id="edit-title"
                                      value={editingTask.title}
                                      onChange={(e) => setEditingTask({
                                        ...editingTask,
                                        title: e.target.value
                                      })}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-companyName">Company Name</Label>
                                    <Input
                                      id="edit-companyName"
                                      value={editingTask.companyName}
                                      onChange={(e) => setEditingTask({
                                        ...editingTask,
                                        companyName: e.target.value
                                      })}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-companyWebsite">Company Website</Label>
                                    <Input
                                      id="edit-companyWebsite"
                                      value={editingTask.companyWebsite}
                                      onChange={(e) => setEditingTask({
                                        ...editingTask,
                                        companyWebsite: e.target.value
                                      })}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-contactPerson">Contact Person</Label>
                                    <Input
                                      id="edit-contactPerson"
                                      value={editingTask.contactPerson}
                                      onChange={(e) => setEditingTask({
                                        ...editingTask,
                                        contactPerson: e.target.value
                                      })}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-position">Position</Label>
                                    <Input
                                      id="edit-position"
                                      value={editingTask.position}
                                      onChange={(e) => setEditingTask({
                                        ...editingTask,
                                        position: e.target.value
                                      })}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-location">Location</Label>
                                    <Input
                                      id="edit-location"
                                      value={editingTask.location}
                                      onChange={(e) => setEditingTask({
                                        ...editingTask,
                                        location: e.target.value
                                      })}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-recipients">Recipient Email</Label>
                                    <Input
                                      id="edit-recipients"
                                      value={editingTask.recipients[0] || ""}
                                      onChange={(e) => setEditingTask({
                                        ...editingTask,
                                        recipients: [e.target.value]
                                      })}
                                    />
                                  </div>

                                  <div className="flex justify-end space-x-2 pt-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditingTask(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => updateTask(editingTask)}
                                    >
                                      Save Changes
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            <TabsContent value="completed" className="border rounded-md mt-2">
              {completedTasks.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No completed applications</div>
              ) : (
                completedTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={(checked) => toggleTaskCompletion(task.id, checked as boolean)}
                      />
                      <div className="line-through text-muted-foreground">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm">{task.companyName}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle>New Application</CardTitle>
            <CardDescription>Add a new company to contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Application Title</Label>
              <Input
                id="title"
                placeholder="e.g., Developer Position at Company X"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g., Acme Corporation"
                value={newTask.companyName}
                onChange={(e) => setNewTask({ ...newTask, companyName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Company Website</Label>
              <Input
                id="companyWebsite"
                placeholder="e.g., https://www.acme.com"
                value={newTask.companyWebsite}
                onChange={(e) => setNewTask({ ...newTask, companyWebsite: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                placeholder="e.g., Jean Dupont"
                value={newTask.contactPerson}
                onChange={(e) => setNewTask({ ...newTask, contactPerson: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                placeholder="e.g., Développeur Web, Alternance"
                value={newTask.position}
                onChange={(e) => setNewTask({ ...newTask, position: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Paris, Lyon, Remote"
                value={newTask.location}
                onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Notes</Label>
              <Input
                id="description"
                placeholder="Any additional notes"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipients">Recipient Email</Label>
              <Input
                id="recipients"
                placeholder="e.g., contact@acme.com"
                value={newTask.recipients ? newTask.recipients[0] || "" : ""}
                onChange={(e) => setNewTask({ ...newTask, recipients: [e.target.value] })}
              />
            </div>

            <div className="space-y-2">
              <Label>Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date)
                      setNewTask({ ...newTask, dueDate: date })
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="reminder"
                checked={newTask.reminderEnabled}
                onCheckedChange={(checked) => setNewTask({ ...newTask, reminderEnabled: checked as boolean })}
              />
              <Label htmlFor="reminder">Send email immediately</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={addTask} 
              disabled={!newTask.title || !newTask.companyName || !newTask.recipients || newTask.recipients.length === 0 || newTask.recipients[0] === ""}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="flex items-center justify-between p-4 border-t">
        <Button 
          onClick={handleSendAllPendingEmails}
          className="flex items-center"
          disabled={isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending Emails...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Send All Pending Emails
            </>
          )}
        </Button>
        {isSending && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <h3 className="text-lg font-semibold">Sending Emails</h3>
                <p className="text-center text-muted-foreground">
                  Please wait while we send your applications...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

