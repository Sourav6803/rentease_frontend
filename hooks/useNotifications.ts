'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/components/providers/SocketProvider'
import { playNotificationSound } from '@/lib/notificationSound'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationDoc,
} from '@/lib/api/notifications'

/** Normalized notification shape consumed by every header bell. */
export interface UINotification {
  id: string
  title: string
  body: string
  type?: string
  category?: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: string
}

/** Payload delivered over Socket.IO (`notification:receive`). */
interface SocketNotification {
  id?: string
  _id?: string
  title?: string
  body?: string
  content?: { text?: string; preview?: string } | string
  type?: string
  category?: string
  data?: Record<string, unknown>
  read?: boolean
  createdAt?: string
}

function textFromContent(content: NotificationDoc['content']): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  return content.text || content.preview || ''
}

function normalizeDoc(doc: NotificationDoc): UINotification {
  return {
    id: doc._id,
    title: doc.title,
    body: textFromContent(doc.content),
    type: doc.type,
    category: doc.category,
    data: doc.data,
    read: Boolean(doc.readAt || doc.tracking?.readAt),
    createdAt: doc.createdAt,
  }
}

function normalizeSocket(p: SocketNotification): UINotification {
  const body =
    p.body ??
    (typeof p.content === 'string'
      ? p.content
      : p.content?.text || p.content?.preview || '')
  return {
    id: (p.id || p._id || '') as string,
    title: p.title || 'Notification',
    body,
    type: p.type,
    category: p.category,
    data: p.data,
    read: Boolean(p.read),
    createdAt: p.createdAt || new Date().toISOString(),
  }
}

interface UseNotificationsOptions {
  /** Fetch the persisted list on mount. Default true. */
  autoFetch?: boolean
  /** Cap how many notifications are held in state. Default 30. */
  limit?: number
}

/**
 * Shared notifications hook for every role's header bell.
 *
 * - Loads the persisted list + unread count over REST.
 * - Subscribes to the live `notification:receive` socket event, prepends new
 *   items, and plays the notification chime.
 * - Exposes optimistic mark-read / mark-all-read actions.
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const { autoFetch = true, limit = 30 } = options

  const { data: session, status } = useSession()
  const accessToken = session?.user?.accessToken
  const { socket } = useSocket()

  const [notifications, setNotifications] = useState<UINotification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unreadCount = notifications.reduce((n, item) => (item.read ? n : n + 1), 0)

  // Keep a stable ref of known ids to de-dupe socket pushes vs fetched list.
  const seenIds = useRef<Set<string>>(new Set())

  const fetchList = useCallback(async () => {
    if (!accessToken) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchNotifications(accessToken, { limit })
      const docs = res?.data?.notifications ?? []
      const mapped = docs.map(normalizeDoc)
      seenIds.current = new Set(mapped.map((m) => m.id))
      setNotifications(mapped)
    } catch (err) {
      setError((err as Error).message || 'Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, limit])

  useEffect(() => {
    if (autoFetch && status === 'authenticated' && accessToken) {
      fetchList()
    }
  }, [autoFetch, status, accessToken, fetchList])

  // Live updates over the socket.
  useEffect(() => {
    if (!socket) return

    const onReceive = (payload: SocketNotification) => {
      const incoming = normalizeSocket(payload)
      if (!incoming.id || seenIds.current.has(incoming.id)) return
      seenIds.current.add(incoming.id)
      setNotifications((prev) => [incoming, ...prev].slice(0, limit))
      if (!incoming.read) playNotificationSound()
    }

    socket.on('notification:receive', onReceive)
    return () => {
      socket.off('notification:receive', onReceive)
    }
  }, [socket, limit])

  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      if (!accessToken) return
      try {
        await markNotificationRead(accessToken, id)
      } catch {
        // Re-sync on failure so the badge doesn't drift from the server.
        fetchList()
      }
    },
    [accessToken, fetchList]
  )

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    if (!accessToken) return
    try {
      await markAllNotificationsRead(accessToken)
    } catch {
      fetchList()
    }
  }, [accessToken, fetchList])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchList,
    markAsRead,
    markAllAsRead,
  }
}
