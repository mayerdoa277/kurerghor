import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { envConfig } from '../config/env.js'

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
    console.log('🔌 Initializing socket connection...');
    
    // Get socket URL from environment configuration
    const socketUrl = envConfig.socketUrl;
    console.log('🌐 Connecting to socket URL:', socketUrl);
    console.log('🔧 Environment:', envConfig.mode, '| Debug enabled:', envConfig.enableDebug);
    
    // Create socket instance with proper configuration
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Allow fallback to polling
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // Temporarily remove auth for debugging
      // auth: token ? { token, userId: 'user123' } : { userId: 'guest123' }
      auth: { userId: 'user123' } // Temporary user ID for room management
    })

    // Debug: Log socket instance details
    console.log('🔍 Socket instance created:', {
      type: typeof socketInstance,
      hasOn: typeof socketInstance.on === 'function',
      hasEmit: typeof socketInstance.emit === 'function',
      methods: Object.getOwnPropertyNames(Object.getPrototypeOf(socketInstance)).slice(0, 15)
    });

    // Connection event
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected successfully!')
      console.log('📋 Socket ID:', socketInstance.id)
      console.log('🌐 Transport:', socketInstance.io.engine.transport.name)
      setConnected(true)
    })

    // Disconnection event
    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason)
      setConnected(false)
    })

    // Connection error event
    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type,
        advice: error.advice
      })
    })

    // Reconnection events
    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`� Socket reconnected after ${attemptNumber} attempts`)
    })

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Socket reconnection attempt ${attemptNumber}`)
    })

    socketInstance.on('reconnect_error', (error) => {
      console.error('❌ Socket reconnection error:', error)
    })

    socketInstance.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed')
    })

    // Set socket instance
    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      console.log('🧹 Disconnecting socket...')
      socketInstance.disconnect()
    }
  }, []) // Remove token dependency for now

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
