import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, FileText, Calendar, Pill } from "lucide-react"

interface Notification {
  id: number
  type: string
  message: string
  time: string
}

interface NotificationPanelProps {
  notifications: Notification[]
  className?: string
}

export function NotificationPanel({ notifications, className }: NotificationPanelProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "lab-report":
      case "lab":
        return <FileText className="h-4 w-4" />
      case "appointment":
        return <Calendar className="h-4 w-4" />
      case "medication":
        return <Pill className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "lab-report":
      case "lab":
        return "bg-blue-100 text-blue-800"
      case "appointment":
        return "bg-green-100 text-green-800"
      case "medication":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>{notifications.length} new notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
