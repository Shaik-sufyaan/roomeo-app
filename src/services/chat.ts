// services/chat.ts - Basic chat functionality - Mobile adapted
import { supabase } from './supabase'
import type { ChatMessage, Chat } from '../types/chat'

// Re-export types for easier importing
export type { Chat, ChatMessage } from '../types/chat'

/**
 * Get all chats for a user
 */
export const getUserChats = async (userId: string): Promise<{ success: boolean; chats?: Chat[]; error?: string }> => {
  try {
    const { data: chats, error } = await supabase
      .from('chats')
      .select(`
        *,
        user1:users!chats_user1_id_fkey(id, name, profilepicture),
        user2:users!chats_user2_id_fkey(id, name, profilepicture)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching chats:', error)
      return { success: false, error: error.message }
    }

    // Format chats with other user info
    const formattedChats: Chat[] = (chats || []).map(chat => {
      const isUser1 = chat.user1_id === userId
      const otherUser = isUser1 ? chat.user2 : chat.user1

      return {
        ...chat,
        other_user_name: otherUser?.name || 'Unknown User',
        other_user_avatar: otherUser?.profilepicture || ''
      }
    })

    return { success: true, chats: formattedChats }
  } catch (error) {
    console.error('Unexpected error fetching chats:', error)
    return { success: false, error: 'Failed to fetch chats' }
  }
}

/**
 * Get messages for a specific chat
 */
export const getChatMessages = async (chatId: string): Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }> => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(name, profilepicture)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return { success: false, error: error.message }
    }

    // Format messages with sender info
    const formattedMessages: ChatMessage[] = (messages || []).map(message => ({
      ...message,
      sender_name: message.sender?.name || 'Unknown',
      sender_avatar: message.sender?.profilepicture || ''
    }))

    return { success: true, messages: formattedMessages }
  } catch (error) {
    console.error('Unexpected error fetching messages:', error)
    return { success: false, error: 'Failed to fetch messages' }
  }
}

/**
 * Send a message to a chat
 */
export const sendMessage = async (chatId: string, senderId: string, content: string): Promise<{ success: boolean; message?: ChatMessage; error?: string }> => {
  try {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content: content.trim(),
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(name, profilepicture)
      `)
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return { success: false, error: error.message }
    }

    // Update chat last_message
    await supabase
      .from('chats')
      .update({
        last_message: content.trim(),
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)

    const formattedMessage: ChatMessage = {
      ...message,
      sender_name: message.sender?.name || 'Unknown',
      sender_avatar: message.sender?.profilepicture || ''
    }

    return { success: true, message: formattedMessage }
  } catch (error) {
    console.error('Unexpected error sending message:', error)
    return { success: false, error: 'Failed to send message' }
  }
}

/**
 * Create or get existing chat between two users
 */
export const createOrGetChat = async (user1Id: string, user2Id: string): Promise<{ success: boolean; chat?: Chat; error?: string }> => {
  try {
    // Check if chat already exists between these users (either direction)
    const { data: existingChats, error: chatError } = await supabase
      .from('chats')
      .select(`
        *,
        user1:users!chats_user1_id_fkey(id, name, profilepicture),
        user2:users!chats_user2_id_fkey(id, name, profilepicture)
      `)
      .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)

    // If we found existing chats, return the first one
    if (!chatError && existingChats && existingChats.length > 0) {
      console.log(`✅ Found existing chat between users ${user1Id} and ${user2Id}:`, existingChats[0].id)
      const existingChat = existingChats[0]
      // Format existing chat
      const isUser1 = existingChat.user1_id === user1Id
      const otherUser = isUser1 ? existingChat.user2 : existingChat.user1

      const formattedChat: Chat = {
        ...existingChat,
        other_user_name: otherUser?.name || 'Unknown User',
        other_user_avatar: otherUser?.profilepicture || ''
      }

      return { success: true, chat: formattedChat }
    }

    // Create new chat if it doesn't exist
    console.log(`🔄 No existing chat found between users ${user1Id} and ${user2Id}, creating new chat...`)
    const { data: newChat, error: createError } = await supabase
      .from('chats')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        user1:users!chats_user1_id_fkey(id, name, profilepicture),
        user2:users!chats_user2_id_fkey(id, name, profilepicture)
      `)
      .single()

    if (createError) {
      console.error('Error creating chat:', createError)
      return { success: false, error: createError.message }
    }

    console.log(`✅ Created new chat:`, newChat.id)
    // Format new chat
    const isUser1 = newChat.user1_id === user1Id
    const otherUser = isUser1 ? newChat.user2 : newChat.user1

    const formattedChat: Chat = {
      ...newChat,
      other_user_name: otherUser?.name || 'Unknown User',
      other_user_avatar: otherUser?.profilepicture || ''
    }

    return { success: true, chat: formattedChat }
  } catch (error) {
    console.error('Unexpected error creating/getting chat:', error)
    return { success: false, error: 'Failed to create or get chat' }
  }
}

/**
 * Mark messages as read in a chat
 */
export const markMessagesAsRead = async (chatId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', userId) // Don't mark own messages as read
      .eq('is_read', false)

    if (error) {
      console.error('Error marking messages as read:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error marking messages as read:', error)
    return { success: false, error: 'Failed to mark messages as read' }
  }
}

/**
 * Get unread message count for a user
 */
export const getUnreadMessageCount = async (userId: string): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    // Get all chats where user is participant
    const { data: userChats, error: chatsError } = await supabase
      .from('chats')
      .select('id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

    if (chatsError) {
      console.error('Error fetching user chats for unread count:', chatsError)
      return { success: false, error: chatsError.message }
    }

    if (!userChats || userChats.length === 0) {
      return { success: true, count: 0 }
    }

    const chatIds = userChats.map(chat => chat.id)

    // Count unread messages in those chats (not sent by current user)
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .in('chat_id', chatIds)
      .neq('sender_id', userId)
      .eq('is_read', false)

    if (messagesError) {
      console.error('Error counting unread messages:', messagesError)
      return { success: false, error: messagesError.message }
    }

    return { success: true, count: unreadMessages?.length || 0 }
  } catch (error) {
    console.error('Unexpected error getting unread message count:', error)
    return { success: false, error: 'Failed to get unread count' }
  }
}

/**
 * Delete a chat (for the current user)
 */
export const deleteChat = async (chatId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify user is part of this chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('user1_id, user2_id')
      .eq('id', chatId)
      .single()

    if (chatError || !chat) {
      return { success: false, error: 'Chat not found' }
    }

    if (chat.user1_id !== userId && chat.user2_id !== userId) {
      return { success: false, error: 'You are not a participant in this chat' }
    }

    // Delete all messages in the chat
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('chat_id', chatId)

    if (messagesError) {
      console.error('Error deleting messages:', messagesError)
      return { success: false, error: messagesError.message }
    }

    // Delete the chat
    const { error: deleteError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)

    if (deleteError) {
      console.error('Error deleting chat:', deleteError)
      return { success: false, error: deleteError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting chat:', error)
    return { success: false, error: 'Failed to delete chat' }
  }
}