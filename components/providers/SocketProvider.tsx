'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

// Socket.IO connects to the server root (same origin as the REST API, on the
// `/socket.io` path) — NOT the `/api/v1` prefix. Prefer an explicit
// NEXT_PUBLIC_SOCKET_URL, but fall back to the shared NEXT_PUBLIC_API_BASE_URL
// so a single env var (already required for every REST call) also drives the
// socket. Without this, a production build with no NEXT_PUBLIC_SOCKET_URL set
// silently falls back to localhost and the WebSocket handshake fails.
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000'

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken

  useEffect(() => {
    if (!accessToken) return

    const socketInstance = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: {
        token: accessToken,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected')
      setSocket(socketInstance)
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected')
      setSocket(null)
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [accessToken])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}