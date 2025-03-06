"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, ChevronLeft, PlusCircle, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Task type definition
type Task = {
  id: string
  title: string
  description: string
  dueDate: Date | undefined
  completed: boolean
  reminderEnabled: boolean
}

export default function TasksPage() {
  // Sample initial tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      description: "Finish the Q3 project proposal for client review",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      completed: false,
      reminderEnabled: true,
    },
    {
      id: "2",
      title: "Weekly team meeting",
      description: "Prepare agenda for the weekly team sync",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      completed: true,
      reminderEnabled: true,
    },
  ])

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    dueDate: undefined,
    completed: false,
    reminderEnabled: true,
  })

  const [date, setDate] = useState<Date | undefined>(undefined)

  // Add a new task
  const addTask = () => {
    if (!newTask.title) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || "",
      dueDate: newTask.dueDate,
      completed: false,
      reminderEnabled: newTask.reminderEnabled || false,
    }

    setTasks([...tasks, task])
    setNewTask({
      title: "",
      description: "",
      dueDate: undefined,
      completed: false,
      reminderEnabled: true,
    })
    setDate(undefined)
  }

  // Toggle task completion status
  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  // Toggle reminder setting for a task
  const toggleReminder = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, reminderEnabled: !task.reminderEnabled } : task)))
  }

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  // Filter tasks by completion status
  const pendingTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Task Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Tasks</CardTitle>
            <CardDescription>Manage your tasks and set up reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pending
                  {pendingTasks.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {pendingTasks.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                  {completedTasks.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {completedTasks.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending tasks. Add a new task to get started.
                  </div>
                ) : (
                  pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <Label htmlFor={`task-${task.id}`} className="font-medium cursor-pointer">
                            {task.title}
                          </Label>
                          <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          {task.dueDate ? (
                            <span className="text-xs bg-muted px-2 py-1 rounded-md flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              Due: {format(task.dueDate, "PPP")}
                            </span>
                          ) : (
                            <span></span>
                          )}
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`reminder-${task.id}`}
                              checked={task.reminderEnabled}
                              onCheckedChange={() => toggleReminder(task.id)}
                            />
                            <Label htmlFor={`reminder-${task.id}`} className="text-xs cursor-pointer">
                              Email reminder
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No completed tasks yet.</div>
                ) : (
                  completedTasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-4 p-4 border rounded-lg bg-muted/30">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <Label
                            htmlFor={`task-${task.id}`}
                            className="font-medium cursor-pointer line-through text-muted-foreground"
                          >
                            {task.title}
                          </Label>
                          <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-through">{task.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
            <CardDescription>Create a new task and set reminder options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Enter task description"
                value={newTask.description || ""}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
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
              <Label htmlFor="reminder">Enable email reminders</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={addTask} disabled={!newTask.title}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

