import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Mail } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">A1ST -Spontaneous Job Application Manager</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Track your job applications, manage CVs, and send automatic email reminders for follow-ups
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl">Task Management</CardTitle>
            <CheckCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">Create, edit and manage your tasks with ease</CardDescription>
            <Link href="/tasks">
              <Button className="w-full">Manage Tasks</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl">Reminders</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">Set up automatic reminders for your pending tasks</CardDescription>
            <Link href="/reminders">
              <Button className="w-full">Configure Reminders</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl">Email Templates</CardTitle>
            <Mail className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">Customize email templates for your reminders</CardDescription>
            <Link href="/templates">
              <Button className="w-full">Edit Templates</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Simple steps to get started with your job application tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-3">
            <li className="text-muted-foreground">Create job application tasks with company details and due dates</li>
            <li className="text-muted-foreground">Upload and manage your CV for each application</li>
            <li className="text-muted-foreground">Track application status (pending or completed)</li>
            <li className="text-muted-foreground">Enable email reminders for follow-ups</li>
            <li className="text-muted-foreground">Import and export your application data</li>
            <li className="text-muted-foreground">Customize email templates for professional communications</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
