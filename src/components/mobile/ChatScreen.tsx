// components/mobile/ChatScreen.tsx - Mobile-native chat screen with real data
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import type { User } from '../../types/user';
import type { Chat } from '../../types/chat';
import { getUserChats } from '../../services/chat';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ChatScreenProps {
  user: User;
  onRefresh: () => void;
  refreshing: boolean;
  onChatPress?: (chatId: string, chatPartner: any) => void;
}

// Using Chat from types/chat instead of local interface

// Mock chat data
const mockChats: ChatItem[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    imageUrl: 'https://via.placeholder.com/50x50/44C76F/004D40?text=SC',
    lastMessage: 'Perfect! When can we schedule a tour?',
    lastMessageTime: '2 min ago',
    unreadCount: 3,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Mike Johnson',
    imageUrl: 'https://via.placeholder.com/50x50/44C76F/004D40?text=MJ',
    lastMessage: 'The apartment has great natural light',
    lastMessageTime: '1 hour ago',
    unreadCount: 1,
    isOnline: false,
  },
  {
    id: '3',
    name: 'Emily Davis',
    imageUrl: 'https://via.placeholder.com/50x50/44C76F/004D40?text=ED',
    lastMessage: 'Thanks for sharing the photos!',
    lastMessageTime: '3 hours ago',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Alex Kim',
    imageUrl: 'https://via.placeholder.com/50x50/44C76F/004D40?text=AK',
    lastMessage: 'That works for me 👍',
    lastMessageTime: 'Yesterday',
    isOnline: false,
  },
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  user,
  onRefresh,
  refreshing,
  onChatPress,
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real chats from Supabase
  const loadConversations = async () => {
    if (!user?.id) {
      setError('User information not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading chats for:', user.id);
      const result = await getUserChats(user.id);

      if (result.success && result.chats) {
        setChats(result.chats);
        console.log('✅ Loaded chats:', result.chats.length);
      } else {
        console.warn('⚠️ No chats found or error:', result.error);
        setChats([]);
        if (result.error) {
          setError(`Failed to load chats: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading chats:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setError('Failed to load chats. Please try again.');
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  // Simple time formatter
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  const handleRefresh = async () => {
    await loadConversations();
    onRefresh(); // Call parent refresh if needed
  };

  const handleChatPress = (chat: Chat) => {
    if (onChatPress) {
      const chatPartner = {
        id: chat.id,
        name: chat.other_user_name,
        imageUrl: chat.other_user_avatar,
        isOnline: false, // TODO: Add online status to Chat type
      };
      onChatPress(chat.id, chatPartner);
    } else {
      Alert.alert(
        'Open Chat',
        `Open conversation with ${chat.other_user_name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open', onPress: () => console.log(`Opening chat with ${chat.other_user_name}`) },
        ]
      );
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: item.other_user_avatar ||
                 `https://via.placeholder.com/50x50/44C76F/004D40?text=${item.other_user_name?.charAt(0) || 'U'}`
          }}
          style={styles.avatar}
        />
        {/* TODO: Add online status when available */}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.other_user_name}</Text>
          <Text style={styles.chatTime}>
            {formatTime(new Date(item.updated_at))}
          </Text>
        </View>
        <Text
          style={[
            styles.lastMessage,
            // TODO: Add unread message styling when unread count is available
          ]}
          numberOfLines={1}
        >
          {item.last_message || 'No messages yet'}
        </Text>
      </View>

      {/* TODO: Add unread badge when unread count is available in Chat type */}
    </TouchableOpacity>
  );

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading your conversations...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorTitle}>⚠️ Oops!</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>TRY AGAIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show empty state
  if (chats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>💬 No Conversations</Text>
        <Text style={styles.emptySubtitle}>
          Start matching with roommates to begin chatting!
        </Text>
        <TouchableOpacity style={styles.discoverButton}>
          <Text style={styles.discoverButtonText}>FIND MATCHES</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>
          {chats.filter(c => c.unreadCount).length} unread conversation{chats.filter(c => c.unreadCount).length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#004D40',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  listContainer: {
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
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
  },
  unreadMessage: {
    color: '#004D40',
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 82,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  discoverButton: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#004D40',
  },
  discoverButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
  },

  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },

  // Error state styles
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
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
});