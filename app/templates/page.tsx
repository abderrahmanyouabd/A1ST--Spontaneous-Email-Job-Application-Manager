"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Mail, Save } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState({
    taskDue: {
      subject: "Task Due Today: {{taskTitle}}",
      body: `Hello {{recipientName}},

This is a reminder that the following task is due today:

Task: {{taskTitle}}
Description: {{taskDescription}}
Due Date: {{dueDate}}

Please complete this task as soon as possible or update its status in the system.

Thank you,
Task Reminder System`,
    },
    taskOverdue: {
      subject: "OVERDUE: {{taskTitle}}",
      body: `Hello {{recipientName}},

The following task is now overdue:

Task: {{taskTitle}}
Description: {{taskDescription}}
Due Date: {{dueDate}} (OVERDUE)

Please complete this task immediately or update its status in the system.

Thank you,
Task Reminder System`,
    },
    dailySummary: {
      subject: "Daily Task Summary - {{date}}",
      body: `Hello {{recipientName}},

Here is your daily task summary for {{date}}:

COMPLETED TASKS:
{{completedTasks}}

PENDING TASKS:
{{pendingTasks}}

UPCOMING DEADLINES:
{{upcomingDeadlines}}

Thank you,
Task Reminder System`,
    },
  })

  const updateTemplate = (type: string, field: string, value: string) => {
    setTemplates({
      ...templates,
      [type]: {
        ...templates[type as keyof typeof templates],
        [field]: value,
      },
    })
  }

  const [previewData] = useState({
    recipientName: "John Doe",
    taskTitle: "Complete Project Proposal",
    taskDescription: "Finish the Q3 project proposal for client review",
    dueDate: "June 15, 2023",
    date: "June 14, 2023",
    completedTasks: "- Website redesign\n- Client meeting notes\n- Budget approval",
    pendingTasks: "- Complete Project Proposal\n- Weekly team meeting\n- Update documentation",
    upcomingDeadlines: "- Complete Project Proposal (Due: June 15, 2023)\n- Weekly team meeting (Due: June 16, 2023)",
  })

  const renderPreview = (template: string) => {
    let preview = template

    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, "g"), value)
    })

    return preview
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Email Templates</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Email Templates</CardTitle>
            <CardDescription>Customize the content of reminder emails</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="taskDue" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="taskDue">Task Due</TabsTrigger>
                <TabsTrigger value="taskOverdue">Task Overdue</TabsTrigger>
                <TabsTrigger value="dailySummary">Daily Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="taskDue" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="taskDue-subject">Email Subject</Label>
                  <Input
                    id="taskDue-subject"
                    value={templates.taskDue.subject}
                    onChange={(e) => updateTemplate("taskDue", "subject", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taskDue-body">Email Body</Label>
                  <Textarea
                    id="taskDue-body"
                    rows={12}
                    value={templates.taskDue.body}
                    onChange={(e) => updateTemplate("taskDue", "body", e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="taskOverdue" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="taskOverdue-subject">Email Subject</Label>
                  <Input
                    id="taskOverdue-subject"
                    value={templates.taskOverdue.subject}
                    onChange={(e) => updateTemplate("taskOverdue", "subject", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taskOverdue-body">Email Body</Label>
                  <Textarea
                    id="taskOverdue-body"
                    rows={12}
                    value={templates.taskOverdue.body}
                    onChange={(e) => updateTemplate("taskOverdue", "body", e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="dailySummary" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dailySummary-subject">Email Subject</Label>
                  <Input
                    id="dailySummary-subject"
                    value={templates.dailySummary.subject}
                    onChange={(e) => updateTemplate("dailySummary", "subject", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailySummary-body">Email Body</Label>
                  <Textarea
                    id="dailySummary-body"
                    rows={12}
                    value={templates.dailySummary.body}
                    onChange={(e) => updateTemplate("dailySummary", "body", e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Preview</CardTitle>
            <CardDescription>See how your emails will look</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email Preview
              </h3>

              <div className="border rounded-md p-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Subject:</p>
                  <p className="text-sm bg-muted p-2 rounded">{renderPreview(templates.taskDue.subject)}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Body:</p>
                  <div className="text-sm bg-muted p-2 rounded whitespace-pre-wrap">
                    {renderPreview(templates.taskDue.body)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Available Variables</h3>
              <div className="text-sm space-y-1">
                <p>
                  <code>
                    {`{{`}recipientName{`}}`}
                  </code>{" "}
                  - Recipient's name
                </p>
                <p>
                  <code>
                    {`{{`}taskTitle{`}}`}
                  </code>{" "}
                  - Task title
                </p>
                <p>
                  <code>
                    {`{{`}taskDescription{`}}`}
                  </code>{" "}
                  - Task description
                </p>
                <p>
                  <code>
                    {`{{`}dueDate{`}}`}
                  </code>{" "}
                  - Task due date
                </p>
                <p>
                  <code>
                    {`{{`}date{`}}`}
                  </code>{" "}
                  - Current date
                </p>
                <p>
                  <code>
                    {`{{`}completedTasks{`}}`}
                  </code>{" "}
                  - List of completed tasks
                </p>
                <p>
                  <code>
                    {`{{`}pendingTasks{`}}`}
                  </code>{" "}
                  - List of pending tasks
                </p>
                <p>
                  <code>
                    {`{{`}upcomingDeadlines{`}}`}
                  </code>{" "}
                  - List of upcoming deadlines
                </p>
              </div>
            </div>

            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

