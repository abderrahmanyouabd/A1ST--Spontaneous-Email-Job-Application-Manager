"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Clock, Mail, Save } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { sendReminderEmails } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

const mockTasks = [
  {
    id: "1",
    title: "Test Task",
    description: "This is a test task.",
    dueDate: new Date(),
    completed: false,
    reminderEnabled: true,
  },
];

export default function RemindersPage() {
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    frequency: "daily",
    time: "09:00",
    sendToTaskOwner: true,
    ccManagers: false,
    sendCompletedSummary: true,
    sendPendingSummary: true,
    recipients: [],
  })

  const [recipients, setRecipients] = useState([
    { email: "user@example.com", name: "John Doe", role: "Task Owner" },
    { email: "manager@example.com", name: "Jane Smith", role: "Manager" },
  ])

  const [newRecipient, setNewRecipient] = useState({ email: "", name: "", role: "team-member" })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setReminderSettings(data);
        setRecipients(data.recipients || []);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingsChange = (key: string, value: any) => {
    setReminderSettings({
      ...reminderSettings,
      [key]: value,
    })
  }

  const addRecipient = () => {
    if (!newRecipient.email || !newRecipient.name) return;

    setRecipients([...recipients, newRecipient]);
    setNewRecipient({ email: "", name: "", role: "team-member" });
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r.email !== email));
  };

  const handleSendTestEmail = async () => {
    const tasksToSend = mockTasks.filter(task => task.reminderEnabled);
    try {
      const response = await fetch('/api/sendReminderEmails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: tasksToSend }),
      });

      console.log("Response received:", response);

      if (!response.ok) {
        throw new Error('Failed to send test emails');
      }

      const data = await response.json();
      console.log("Data received:", data);
      toast({
        title: "Test emails sent successfully",
        description: data.message,
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Failed to send test emails",
        description: "There was an error sending the test emails. Please try again.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  }

  const handleSaveSettings = async () => {
    try {
      const settingsToSave = {
        ...reminderSettings,
        recipients,
      };

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsToSave),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      toast({
        title: "Settings Saved",
        description: "Your reminder settings have been saved successfully.",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: "There was an error saving your settings. Please try again.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleClearSettings = () => {
    setReminderSettings({
      enabled: true,
      frequency: "daily",
      time: "09:00",
      sendToTaskOwner: true,
      ccManagers: false,
      sendCompletedSummary: true,
      sendPendingSummary: true,
      recipients: [],
    });
    toast({
      title: "Settings Cleared",
      description: "Your reminder settings have been cleared.",
      action: <ToastAction altText="Close">Close</ToastAction>,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Reminder Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Email Reminder Configuration</CardTitle>
            <CardDescription>Configure when and how task reminders are sent</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="schedule" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="recipients">Recipients</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="schedule" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Automatic Reminders</Label>
                    <p className="text-sm text-muted-foreground">Turn on/off all email reminders</p>
                  </div>
                  <Switch
                    checked={reminderSettings.enabled}
                    onCheckedChange={(checked) => handleSettingsChange("enabled", checked)}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Reminder Frequency</Label>
                    <Select
                      value={reminderSettings.frequency}
                      onValueChange={(value) => handleSettingsChange("frequency", value)}
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekdays">Weekdays only</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="custom">Custom schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Reminder Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={reminderSettings.time}
                      onChange={(e) => handleSettingsChange("time", e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Reminder Triggers</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="due-today" checked={true} onCheckedChange={() => {}} />
                      <Label htmlFor="due-today">Tasks due today</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="overdue" checked={true} onCheckedChange={() => {}} />
                      <Label htmlFor="overdue">Overdue tasks</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="upcoming" checked={true} onCheckedChange={() => {}} />
                      <Label htmlFor="upcoming">Upcoming tasks (next 3 days)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="no-progress" checked={false} onCheckedChange={() => {}} />
                      <Label htmlFor="no-progress">Tasks with no progress for 7+ days</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recipients" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Send to Task Owner</Label>
                      <p className="text-sm text-muted-foreground">
                        Always send reminders to the person assigned to the task
                      </p>
                    </div>
                    <Switch
                      checked={reminderSettings.sendToTaskOwner}
                      onCheckedChange={(checked) => handleSettingsChange("sendToTaskOwner", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">CC Managers</Label>
                      <p className="text-sm text-muted-foreground">Include managers in reminder emails</p>
                    </div>
                    <Switch
                      checked={reminderSettings.ccManagers}
                      onCheckedChange={(checked) => handleSettingsChange("ccManagers", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Additional Recipients</h3>

                  <div className="space-y-4">
                    {recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{recipient.name}</p>
                          <p className="text-sm text-muted-foreground">{recipient.email}</p>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full mt-1 inline-block">
                            {recipient.role}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeRecipient(recipient.email)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Recipient name"
                        value={newRecipient.name}
                        onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={newRecipient.email}
                        onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newRecipient.role}
                        onValueChange={(value) => setNewRecipient({ ...newRecipient, role: value })}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="team-member">Team Member</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="stakeholder">Stakeholder</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={addRecipient} disabled={!newRecipient.email || !newRecipient.name}>
                    Add Recipient
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Daily Summary of Completed Tasks</Label>
                      <p className="text-sm text-muted-foreground">Send a daily summary of all completed tasks</p>
                    </div>
                    <Switch
                      checked={reminderSettings.sendCompletedSummary}
                      onCheckedChange={(checked) => handleSettingsChange("sendCompletedSummary", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Daily Summary of Pending Tasks</Label>
                      <p className="text-sm text-muted-foreground">Send a daily summary of all pending tasks</p>
                    </div>
                    <Switch
                      checked={reminderSettings.sendPendingSummary}
                      onCheckedChange={(checked) => handleSettingsChange("sendPendingSummary", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Email Customization</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize the content and appearance of reminder emails
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="subject-prefix">Email Subject Prefix</Label>
                      <Input id="subject-prefix" placeholder="[Task Reminder]" defaultValue="[Task Reminder]" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sender-name">Sender Name</Label>
                      <Input id="sender-name" placeholder="Task Reminder System" defaultValue="Task Reminder System" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-footer">Email Footer Text</Label>
                    <Input
                      id="email-footer"
                      placeholder="This is an automated reminder from the Task Management System."
                      defaultValue="This is an automated reminder from the Task Management System."
                    />
                  </div>

                  <div className="pt-2">
                    <Link href="/templates">
                      <Button variant="outline">Edit Email Templates</Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reminder Actions</CardTitle>
            <CardDescription>Test and manage your reminder settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Current Schedule
              </h3>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p>
                  <strong>Frequency:</strong> {reminderSettings.frequency}
                </p>
                <p>
                  <strong>Time:</strong> {reminderSettings.time}
                </p>
                <p>
                  <strong>Status:</strong> {reminderSettings.enabled ? "Active" : "Disabled"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email Recipients
              </h3>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p>
                  <strong>Total Recipients:</strong> {recipients.length}
                </p>
                <p>
                  <strong>Include Task Owner:</strong> {reminderSettings.sendToTaskOwner ? "Yes" : "No"}
                </p>
                <p>
                  <strong>CC Managers:</strong> {reminderSettings.ccManagers ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Button className="w-full" variant="outline" onClick={handleSendTestEmail}>
                Send Test Email
              </Button>

              <Button className="w-full" onClick={handleSaveSettings}>
                Save Settings
              </Button>

              <Button className="w-full" variant="destructive" onClick={handleClearSettings}>
                Clear Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

