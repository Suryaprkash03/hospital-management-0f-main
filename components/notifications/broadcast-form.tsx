"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Send } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useBroadcastNotifications } from "@/hooks/use-notifications"
import type { NotificationPriority } from "@/lib/types"
import { toast } from "sonner"

export function BroadcastForm() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetGroup, setTargetGroup] = useState("all")
  const [priority, setPriority] = useState<NotificationPriority>("medium")
  const [scheduledFor, setScheduledFor] = useState<Date>()
  const [loading, setLoading] = useState(false)

  const { sendBroadcast } = useBroadcastNotifications()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      await sendBroadcast(title, message, targetGroup, priority, undefined, scheduledFor)

      // Reset form
      setTitle("")
      setMessage("")
      setTargetGroup("all")
      setPriority("medium")
      setScheduledFor(undefined)

      toast.success("Broadcast sent successfully!")
    } catch (error) {
      toast.error("Failed to send broadcast")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Broadcast Notification</CardTitle>
        <CardDescription>Send notifications to all users or specific groups</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Group</Label>
              <Select value={targetGroup} onValueChange={setTargetGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="doctor">Doctors</SelectItem>
                  <SelectItem value="nurse">Nurses</SelectItem>
                  <SelectItem value="receptionist">Receptionists</SelectItem>
                  <SelectItem value="patient">Patients</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value: NotificationPriority) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Schedule For (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !scheduledFor && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledFor ? format(scheduledFor, "PPP") : "Send immediately"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledFor}
                  onSelect={setScheduledFor}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Sending..." : "Send Broadcast"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
