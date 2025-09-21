/**
 * RealtimeChatService - Professional real-time messaging service - Mobile adapted
 * Handles all real-time operations including subscriptions, typing indicators, and status updates
 */

import { supabase } from './supabase'
import { AppState } from 'react-native'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { RealtimePayload } from '../types/chat'

export interface RealtimeMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
  is_delivered: boolean
  is_read: boolean
  client_id?: string
  message_type: 'text' | 'image'
  image_url?: string
  image_thumbnail_url?: string
  sender_name?: string
  sender_avatar?: string
}

export interface TypingEvent {
  chat_id: string
  user_id: string
  user_name: string
  is_typing: boolean
  timestamp: number
}

export interface MessageStatusUpdate {
  message_id: string
  chat_id: string
  is_delivered?: boolean
  is_read?: boolean
}

export interface RealtimeChatEvents {
  message: (message: RealtimeMessage) => void
  messageUpdate: (update: MessageStatusUpdate) => void
  typing: (event: TypingEvent) => void
  userOnline: (userId: string) => void
  userOffline: (userId: string) => void
  connectionStatus: (connected: boolean) => void
  error: (error: Error) => void
}

/**
 * Real-time chat service class for handling all real-time operations - Mobile adapted
 */
export class RealtimeChatService {
  private channels: Map<string, RealtimeChannel> = new Map()
  private eventListeners: Map<string, Partial<RealtimeChatEvents>> = new Map()
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private isConnected: boolean = true
  private appStateSubscription: any = null

  constructor() {
    this.setupAppStateHandling()
  }

  /**
   * Setup app state handling for mobile
   */
  private setupAppStateHandling(): void {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('App became active - checking chat connections')
        this.reconnectAllChats()
      } else if (nextAppState === 'background') {
        console.log('App went to background - maintaining chat connections')
        // Keep connections alive but reduce activity
      }
    })
  }

  /**
   * Subscribe to real-time events for a specific chat
   */
  async subscribeToChat(
    chatId: string,
    userId: string,
    events: Partial<RealtimeChatEvents>
  ): Promise<void> {
    try {
      // Clean up existing subscription if any
      this.unsubscribeFromChat(chatId)

      // Store event listeners
      this.eventListeners.set(chatId, events)

      // Create channel for this chat
      const channel = supabase.channel(`chat:${chatId}`, {
        config: {
          presence: {
            key: userId,
          },
        },
      })

      // Subscribe to message inserts
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          try {
            const newMessage = payload.new as any

            // Fetch complete message with sender info
            const { data: messageWithSender, error } = await supabase
              .from('messages')
              .select(`
                *,
                sender:users!messages_sender_id_fkey(name, profilepicture)
              `)
              .eq('id', newMessage.id)
              .single()

            if (messageWithSender && !error) {
              const realtimeMessage: RealtimeMessage = {
                ...messageWithSender,
                sender_name: messageWithSender.sender?.name || 'Unknown',
                sender_avatar: messageWithSender.sender?.profilepicture || ''
              }

              events.message?.(realtimeMessage)

              // Auto-mark as delivered if it's not from current user
              if (messageWithSender.sender_id !== userId) {
                setTimeout(() => {
                  this.markDelivered(chatId, messageWithSender.id)
                }, 500)
              }
            }
          } catch (error) {
            console.error('Error processing new message:', error)
            events.error?.(error as Error)
          }
        }
      )

      // Subscribe to message updates (status changes)
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          try {
            const updatedMessage = payload.new as any

            const statusUpdate: MessageStatusUpdate = {
              message_id: updatedMessage.id,
              chat_id: updatedMessage.chat_id,
              is_delivered: updatedMessage.is_delivered,
              is_read: updatedMessage.is_read
            }

            events.messageUpdate?.(statusUpdate)
          } catch (error) {
            console.error('Error processing message update:', error)
            events.error?.(error as Error)
          }
        }
      )

      // Subscribe to typing indicators via broadcast
      channel.on('broadcast', { event: 'typing' }, (payload) => {
        try {
          const typingEvent = payload.payload as TypingEvent
          events.typing?.(typingEvent)
        } catch (error) {
          console.error('Error processing typing event:', error)
        }
      })

      // Handle presence (online/offline status)
      channel.on('presence', { event: 'sync' }, () => {
        try {
          const state = channel.presenceState()
          Object.keys(state).forEach(userId => {
            events.userOnline?.(userId)
          })
        } catch (error) {
          console.error('Error processing presence sync:', error)
        }
      })

      channel.on('presence', { event: 'join' }, ({ key }) => {
        events.userOnline?.(key)
      })

      channel.on('presence', { event: 'leave' }, ({ key }) => {
        events.userOffline?.(key)
      })

      // Subscribe and track connection status
      const subscriptionStatus = await channel.subscribe(async (status) => {
        console.log(`Chat ${chatId} subscription status:`, status)

        if (status === 'SUBSCRIBED') {
          this.isConnected = true
          this.reconnectAttempts.set(chatId, 0)
          events.connectionStatus?.(true)

          // Track presence
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          })

        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.isConnected = false
          events.connectionStatus?.(false)

          // Attempt reconnection
          this.attemptReconnection(chatId, userId, events)
        }
      })

      // Store the channel
      this.channels.set(chatId, channel)

      console.log(`✅ Subscribed to chat: ${chatId}`)

    } catch (error) {
      console.error(`Failed to subscribe to chat ${chatId}:`, error)
      events.error?.(error as Error)
      throw error
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(
    chatId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      const channel = this.channels.get(chatId)
      if (!channel) {
        throw new Error(`No active channel for chat ${chatId}`)
      }

      const typingEvent: TypingEvent = {
        chat_id: chatId,
        user_id: userId,
        user_name: userName,
        is_typing: isTyping,
        timestamp: Date.now()
      }

      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: typingEvent
      })

      // Auto-stop typing after 2 seconds
      if (isTyping) {
        const timeoutKey = `${chatId}:${userId}`

        // Clear existing timeout
        const existingTimeout = this.typingTimeouts.get(timeoutKey)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
        }

        // Set new timeout
        const timeout = setTimeout(() => {
          this.sendTypingIndicator(chatId, userId, userName, false)
          this.typingTimeouts.delete(timeoutKey)
        }, 2000)

        this.typingTimeouts.set(timeoutKey, timeout)
      }

    } catch (error) {
      console.error('Failed to send typing indicator:', error)
      const events = this.eventListeners.get(chatId)
      events?.error?.(error as Error)
    }
  }

  /**
   * Mark message as delivered
   */
  async markDelivered(chatId: string, messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_delivered: true })
        .eq('id', messageId)
        .eq('chat_id', chatId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Failed to mark message as delivered:', error)
      const events = this.eventListeners.get(chatId)
      events?.error?.(error as Error)
    }
  }

  /**
   * Mark message as read
   */
  async markRead(chatId: string, messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_delivered: true,
          is_read: true
        })
        .eq('id', messageId)
        .eq('chat_id', chatId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error)
      const events = this.eventListeners.get(chatId)
      events?.error?.(error as Error)
    }
  }

  /**
   * Mark all messages in chat as read
   */
  async markAllRead(chatId: string, userId: string): Promise<void> {
    try {
      // Fallback implementation if RPC function doesn't exist
      const { error } = await supabase
        .from('messages')
        .update({
          is_delivered: true,
          is_read: true
        })
        .eq('chat_id', chatId)
        .neq('sender_id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Failed to mark all messages as read:', error)
      const events = this.eventListeners.get(chatId)
      events?.error?.(error as Error)
    }
  }

  /**
   * Unsubscribe from a chat
   */
  unsubscribeFromChat(chatId: string): void {
    try {
      const channel = this.channels.get(chatId)
      if (channel) {
        channel.unsubscribe()
        this.channels.delete(chatId)
        console.log(`✅ Unsubscribed from chat: ${chatId}`)
      }

      this.eventListeners.delete(chatId)

      // Clear typing timeouts for this chat
      const timeoutKeysToDelete: string[] = []
      this.typingTimeouts.forEach((_, key) => {
        if (key.startsWith(`${chatId}:`)) {
          clearTimeout(this.typingTimeouts.get(key)!)
          timeoutKeysToDelete.push(key)
        }
      })
      timeoutKeysToDelete.forEach(key => this.typingTimeouts.delete(key))

    } catch (error) {
      console.error(`Failed to unsubscribe from chat ${chatId}:`, error)
    }
  }

  /**
   * Unsubscribe from all chats
   */
  unsubscribeFromAllChats(): void {
    try {
      this.channels.forEach((_, chatId) => {
        this.unsubscribeFromChat(chatId)
      })

      // Clear all typing timeouts
      this.typingTimeouts.forEach(timeout => clearTimeout(timeout))
      this.typingTimeouts.clear()

      console.log('✅ Unsubscribed from all chats')
    } catch (error) {
      console.error('Failed to unsubscribe from all chats:', error)
    }
  }

  /**
   * Attempt to reconnect to a chat
   */
  private async attemptReconnection(
    chatId: string,
    userId: string,
    events: Partial<RealtimeChatEvents>
  ): Promise<void> {
    const currentAttempts = this.reconnectAttempts.get(chatId) || 0
    const maxAttempts = 5
    const baseDelay = 1000

    if (currentAttempts >= maxAttempts) {
      console.error(`Max reconnection attempts reached for chat ${chatId}`)
      events.error?.(new Error('Connection failed after multiple attempts'))
      return
    }

    const delay = baseDelay * Math.pow(2, currentAttempts) // Exponential backoff
    this.reconnectAttempts.set(chatId, currentAttempts + 1)

    console.log(`Attempting to reconnect to chat ${chatId} (attempt ${currentAttempts + 1}/${maxAttempts}) in ${delay}ms`)

    setTimeout(() => {
      this.subscribeToChat(chatId, userId, events).catch(error => {
        console.error(`Reconnection attempt ${currentAttempts + 1} failed for chat ${chatId}:`, error)
      })
    }, delay)
  }

  /**
   * Reconnect all active chats (for app state changes)
   */
  private async reconnectAllChats(): Promise<void> {
    const chatIds = Array.from(this.channels.keys())

    for (const chatId of chatIds) {
      const events = this.eventListeners.get(chatId)
      if (events) {
        // Get user ID from channel presence or assume we need to re-establish
        // This is a simplified reconnection - in production you'd store user IDs
        console.log(`Checking connection status for chat ${chatId}`)

        const channel = this.channels.get(chatId)
        if (channel) {
          // Check if channel is still subscribed
          const status = channel.state
          if (status !== 'joined') {
            console.log(`Reconnecting to chat ${chatId}`)
            // Re-subscribe logic would go here
          }
        }
      }
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  /**
   * Get active chat channels
   */
  getActiveChats(): string[] {
    return Array.from(this.channels.keys())
  }

  /**
   * Cleanup service
   */
  destroy(): void {
    this.unsubscribeFromAllChats()

    if (this.appStateSubscription) {
      this.appStateSubscription.remove()
      this.appStateSubscription = null
    }
  }
}

// Singleton instance for the app
export const realtimeChatService = new RealtimeChatService()

// Convenience functions for easier usage
export const subscribeToChat = (chatId: string, userId: string, events: Partial<RealtimeChatEvents>) =>
  realtimeChatService.subscribeToChat(chatId, userId, events)

export const unsubscribeFromChat = (chatId: string) =>
  realtimeChatService.unsubscribeFromChat(chatId)

export const sendTypingIndicator = (chatId: string, userId: string, userName: string, isTyping: boolean) =>
  realtimeChatService.sendTypingIndicator(chatId, userId, userName, isTyping)

export const markMessageRead = (chatId: string, messageId: string) =>
  realtimeChatService.markRead(chatId, messageId)

export const markAllMessagesRead = (chatId: string, userId: string) =>
  realtimeChatService.markAllRead(chatId, userId)