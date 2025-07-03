"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookMarkedIcon as MarkAsRead, Trash2, CheckCheck, Bell } from "lucide-react"
import type { Notification } from "@/lib/types"
import { getNotificationIcon, getNotificationColor, formatNotificationTime } from "@/lib/notification-utils"

interface NotificationDropdownProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => Promise<void>
  onMarkAllAsRead: () => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

export function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose,
}: NotificationDropdownProps) {
  const unreadNotifications = notifications.filter((n) => n.status === "unread")
  const recentNotifications = notifications.slice(0, 10)

  const handleMarkAsRead = async (id: string) => {
    await onMarkAsRead(id)
  }

  const handleDelete = async (id: string) => {
    await onDelete(id)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-muted-foreground">{unreadNotifications.length} unread</p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-xs">
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="p-2">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg mb-2 border transition-colors hover:bg-muted/50 ${
                  notification.status === "unread" ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {notification.status === "unread" && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getNotificationColor(notification.priority)}`}>
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {notification.status === "unread" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <MarkAsRead className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 10 && (
        <>
          <Separator />
          <div className="p-2">
            <Button variant="ghost" className="w-full text-sm" onClick={onClose}>
              View all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
