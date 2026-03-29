import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (token) {
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        withCredentials: true
      })

      socketInstance.on('connect', () => {
        console.log('Socket connected')
        setConnected(true)
      })

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected')
        setConnected(false)
      })

      socketInstance.on('vendor:update', (data) => {
        console.log('Vendor update received:', data)
        // This will be handled by components that listen for vendor updates
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [token])

  const value = {
    socket,
    connected
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
