/**
 * ChatScreen - Fully integrated mobile chat screen with real services
 * Complete integration with useChat hook, getUserChats, and real messaging
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

import { useAuth } from '../../hooks/useAuth'
import { useChat } from '../../hooks/useChat'
import type { Chat } from '../../services/chat'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { normalizeAvatarUrl, getFallbackAvatarUrl } from '../../utils'

interface ChatScreenProps {
  onRefresh: () => void
  refreshing: boolean
  onChatPress?: (chatId: string, chatPartner: any) => void
  onChatCreated?: (chatId: string) => void
  refreshTrigger?: number
  chatTarget?: { sellerId: string; listingId?: string } | null
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onRefresh,
  refreshing,
  onChatPress,
  onChatCreated,
  refreshTrigger,
  chatTarget
}) => {
  const { user, loading: authLoading } = useAuth()
  const {
    chats,
    loading: chatLoading,
    refreshChats,
    createOrGetChatWith
  } = useChat(user)

  const [initializingChat, setInitializingChat] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-initialize chat when coming from marketplace
  useEffect(() => {
    const initializeMarketplaceChat = async () => {
      // Early exit if no chat target or already processed
      if (!chatTarget?.sellerId || !user?.id || initializingChat) {
        return
      }

      const sellerId = chatTarget.sellerId

      console.log('🛒 Auto-initializing marketplace chat with seller:', sellerId)
      setInitializingChat(true)

      try {
        console.log('🔄 Creating/getting chat with marketplace seller...')
        const chatId = await createOrGetChatWith(sellerId)

        if (chatId) {
          console.log('✅ Marketplace chat initialized:', chatId)

          // Notify parent component
          if (onChatCreated) {
            onChatCreated(chatId)
          }

          // Show success message
          Alert.alert(
            'Chat Ready!',
            'Chat with seller has been created. You can now start messaging about the listing.',
            [{ text: 'OK', style: 'default' }]
          )

          // Refresh chats to show the new chat
          await refreshChats()
        } else {
          console.error('❌ Failed to create marketplace chat')
          setError('Failed to create chat with seller')
        }
      } catch (err) {
        console.error('❌ Error initializing marketplace chat:', err)
        setError('Failed to initialize chat. Please try again.')
      } finally {
        setInitializingChat(false)
      }
    }

    initializeMarketplaceChat()
  }, [chatTarget, user?.id, createOrGetChatWith, refreshChats, onChatCreated])

  // Load chats when user changes or refreshTrigger updates
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 ChatScreen refreshing due to trigger change:', refreshTrigger)
      refreshChats()
    }
  }, [user?.id, refreshChats, refreshTrigger])

  // Handle refresh
  const handleRefresh = async () => {
    setError(null)
    await refreshChats()
    onRefresh() // Call parent refresh if needed
  }

  // Handle chat press
  const handleChatPress = (chat: Chat) => {
    if (onChatPress) {
      // Get the other user info for the chat
      const otherUser = {
        id: chat.user1_id === user?.id ? chat.user2_id : chat.user1_id,
        name: chat.other_user_name,
        avatar: chat.other_user_avatar
      }
      onChatPress(chat.id, otherUser)
    } else {
      Alert.alert(
        'Open Chat',
        `Start chatting with ${chat.other_user_name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Chat',
            onPress: () => console.log(`Opening chat with ${chat.other_user_name}`)
          }
        ]
      )
    }
  }

  // Format last message time
  const formatMessageTime = (timestamp: string) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  // Render individual chat item
  const renderChat = ({ item: chat }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => handleChatPress(chat)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: normalizeAvatarUrl(chat.other_user_avatar) || getFallbackAvatarUrl()
          }}
          style={styles.avatar}
          contentFit="cover"
          onError={() => {
            console.log("🖼️ Chat avatar failed to load:", chat.other_user_avatar)
          }}
        />

        {/* Online indicator (you can implement online status later) */}
        <View style={styles.onlineIndicator} />
      </View>

      {/* Chat Info */}
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {chat.other_user_name}
          </Text>
          <Text style={styles.chatTime}>
            {chat.last_message_at ? formatMessageTime(chat.last_message_at) : 'New'}
          </Text>
        </View>

        <Text style={styles.lastMessage} numberOfLines={2}>
          {chat.last_message || 'Start a conversation...'}
        </Text>

        {/* Chat type indicator */}
        <View style={styles.chatMeta}>
          <Ionicons name="chatbubble-outline" size={12} color="#6B7280" />
          <Text style={styles.chatType}>
            Roommate Match
          </Text>
        </View>
      </View>

      {/* Unread indicator and chevron */}
      <View style={styles.chatActions}>
        {/* You can add unread count here later */}
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  )

  // Show loading state
  if (chatLoading || authLoading || initializingChat) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>
            {initializingChat ? 'Setting up your chat...' : 'Loading your conversations...'}
          </Text>
          <Text style={styles.loadingSubtext}>
            {initializingChat
              ? 'Creating chat with seller 💬'
              : 'Getting ready to connect you 🤝'
            }
          </Text>
        </View>
      </View>
    )
  }

  // Show error state
  if (error) {
    return (
      <FlatList
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={chatLoading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.errorContainer}
        data={[]}
        renderItem={() => null}
        ListEmptyComponent={() => (
          <>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={styles.refreshButtonText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </>
        )}
      />
    )
  }

  // Show empty state
  if (!chats || chats.length === 0) {
    return (
      <FlatList
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={chatLoading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.emptyContainer}
        data={[]}
        renderItem={() => null}
        ListEmptyComponent={() => (
          <>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No Chats Yet</Text>
            <Text style={styles.emptyText}>
              Start by swiping and matching with potential roommates. Once you match, you can chat here!
            </Text>
            <Text style={styles.emptySubtext}>
              💡 Tip: Complete your profile and start swiping to find matches
            </Text>
            <TouchableOpacity style={styles.discoverButton} activeOpacity={0.8}>
              <Text style={styles.discoverButtonText}>🔍 START MATCHING</Text>
            </TouchableOpacity>
          </>
        )}
      />
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Your Chats</Text>
        <Text style={styles.headerSubtitle}>
          {chats.length} conversation{chats.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Chats List */}
      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={chatLoading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 80,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#44C76F',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#44C76F',
    borderWidth: 2,
    borderColor: 'white',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  lastMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 18,
  },
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chatType: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  chatActions: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(0, 77, 64, 0.7)',
    textAlign: 'center',
    marginTop: 8,
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#004D40',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(0, 77, 64, 0.8)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 77, 64, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  discoverButton: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#004D40',
    shadowColor: '#004D40',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  discoverButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
  },
})

export default ChatScreen