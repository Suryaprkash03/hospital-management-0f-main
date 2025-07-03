"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  getDocs,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type {
  Notification,
  BroadcastNotification,
  NotificationFilters,
  NotificationSummary,
  NotificationType,
  NotificationPriority,
} from "@/lib/types"
import {
  generateNotificationId,
  generateBroadcastId,
  createNotificationTemplate,
  getTargetUsers,
  sortNotificationsByPriority,
} from "@/lib/notification-utils"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return

    const q = query(collection(db, "notifications"), where("recipientId", "==", user.uid), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          scheduledFor: doc.data().scheduledFor?.toDate(),
          sentAt: doc.data().sentAt?.toDate(),
          readAt: doc.data().readAt?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Notification[]

        const sortedNotifications = sortNotificationsByPriority(notificationsData)
        setNotifications(sortedNotifications)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user?.uid])

  const createNotification = async (
    recipientId: string,
    type: NotificationType,
    priority: NotificationPriority = "medium",
    data: Record<string, any> = {},
    scheduledFor?: Date,
  ) => {
    try {
      const { title, message } = createNotificationTemplate(type, data)
      const notificationId = generateNotificationId()

      await addDoc(collection(db, "notifications"), {
        id: notificationId,
        title,
        message,
        type,
        priority,
        status: "unread",
        recipientId,
        recipientRole: data.recipientRole,
        senderId: user?.uid,
        senderName: data.senderName || "System",
        data,
        scheduledFor: scheduledFor || null,
        sentAt: scheduledFor ? null : serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Send push notification if not scheduled
      if (!scheduledFor) {
        await sendPushNotification(recipientId, { title, body: message, data })
      }
    } catch (err) {
      console.error("Error creating notification:", err)
      throw err
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId)
      await updateDoc(notificationRef, {
        status: "read",
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error("Error marking notification as read:", err)
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db)
      const unreadNotifications = notifications.filter((n) => n.status === "unread")

      unreadNotifications.forEach((notification) => {
        const notificationRef = doc(db, "notifications", notification.id)
        batch.update(notificationRef, {
          status: "read",
          readAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      })

      await batch.commit()
      toast.success("All notifications marked as read")
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
      toast.error("Failed to mark notifications as read")
      throw err
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId)
      await updateDoc(notificationRef, {
        status: "archived",
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error("Error deleting notification:", err)
      throw err
    }
  }

  const clearAllNotifications = async () => {
    try {
      const batch = writeBatch(db)

      notifications.forEach((notification) => {
        const notificationRef = doc(db, "notifications", notification.id)
        batch.update(notificationRef, {
          status: "archived",
          updatedAt: serverTimestamp(),
        })
      })

      await batch.commit()
      toast.success("All notifications cleared")
    } catch (err) {
      console.error("Error clearing notifications:", err)
      toast.error("Failed to clear notifications")
      throw err
    }
  }

  const filterNotifications = (filters: NotificationFilters): Notification[] => {
    return notifications.filter((notification) => {
      const matchesType = !filters.type || notification.type === filters.type
      const matchesPriority = !filters.priority || notification.priority === filters.priority
      const matchesStatus = !filters.status || notification.status === filters.status

      let matchesDateRange = true
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const notificationDate = new Date(notification.createdAt)
        const startDate = new Date(filters.dateRange[0])
        const endDate = new Date(filters.dateRange[1])
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        matchesDateRange = notificationDate >= startDate && notificationDate <= endDate
      }

      return matchesType && matchesPriority && matchesStatus && matchesDateRange
    })
  }

  const getNotificationSummary = (): NotificationSummary => {
    const totalNotifications = notifications.length
    const unreadCount = notifications.filter((n) => n.status === "unread").length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = notifications.filter((n) => {
      const notificationDate = new Date(n.createdAt)
      notificationDate.setHours(0, 0, 0, 0)
      return notificationDate.getTime() === today.getTime()
    }).length

    const highPriorityCount = notifications.filter((n) => n.priority === "high" || n.priority === "critical").length

    const typeDistribution = notifications.reduce(
      (acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1
        return acc
      },
      {} as Record<NotificationType, number>,
    )

    return {
      totalNotifications,
      unreadCount,
      todayCount,
      highPriorityCount,
      typeDistribution,
    }
  }

  return {
    notifications,
    loading,
    error,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    filterNotifications,
    getNotificationSummary,
  }
}

export function useBroadcastNotifications() {
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const q = query(collection(db, "broadcasts"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const broadcastsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        scheduledFor: doc.data().scheduledFor?.toDate(),
        sentAt: doc.data().sentAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as BroadcastNotification[]

      setBroadcasts(broadcastsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const sendBroadcast = async (
    title: string,
    message: string,
    targetGroup: string,
    priority: NotificationPriority = "medium",
    targetUserIds?: string[],
    scheduledFor?: Date,
  ) => {
    try {
      // Get all users to determine targets
      const usersSnapshot = await getDocs(collection(db, "users"))
      const users = usersSnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))

      const targetUsers = getTargetUsers(targetGroup, users, targetUserIds)
      const broadcastId = generateBroadcastId()

      // Create broadcast record
      await addDoc(collection(db, "broadcasts"), {
        id: broadcastId,
        title,
        message,
        targetGroup,
        targetUserIds: targetUserIds || [],
        priority,
        scheduledFor: scheduledFor || null,
        sentAt: scheduledFor ? null : serverTimestamp(),
        createdBy: user?.uid,
        createdByName: user?.email || "Admin",
        totalRecipients: targetUsers.length,
        deliveredCount: 0,
        readCount: 0,
        createdAt: serverTimestamp(),
      })

      // Create individual notifications for each target user
      const batch = writeBatch(db)

      targetUsers.forEach((userId) => {
        const notificationRef = doc(collection(db, "notifications"))
        batch.set(notificationRef, {
          id: generateNotificationId(),
          title,
          message,
          type: "custom_message" as NotificationType,
          priority,
          status: "unread",
          recipientId: userId,
          senderId: user?.uid,
          senderName: user?.email || "Admin",
          data: { broadcastId },
          scheduledFor: scheduledFor || null,
          sentAt: scheduledFor ? null : serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      })

      await batch.commit()

      // Send push notifications if not scheduled
      if (!scheduledFor) {
        await Promise.all(targetUsers.map((userId) => sendPushNotification(userId, { title, body: message })))
      }

      toast.success(`Broadcast sent to ${targetUsers.length} users`)
    } catch (err) {
      console.error("Error sending broadcast:", err)
      toast.error("Failed to send broadcast")
      throw err
    }
  }

  return {
    broadcasts,
    loading,
    sendBroadcast,
  }
}

// Helper function for push notifications (would integrate with FCM)
async function sendPushNotification(userId: string, payload: { title: string; body: string; data?: any }) {
  try {
    // This would integrate with Firebase Cloud Messaging
    // For now, we'll just log the notification
    console.log(`Push notification sent to ${userId}:`, payload)

    // In a real implementation, you would:
    // 1. Get the user's FCM token from the database
    // 2. Send the notification using the Firebase Admin SDK
    // 3. Handle delivery status and retries
  } catch (err) {
    console.error("Error sending push notification:", err)
  }
}
