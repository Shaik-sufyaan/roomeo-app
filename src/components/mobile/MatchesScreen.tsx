/**
 * MatchesScreen - Fully integrated mobile matches screen with real services
 * Complete integration with getMutualMatches, removeMatch, and chat creation
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

import { useAuth } from '../../hooks/useAuth'
import { getMutualMatches, removeMatch, type MatchWithUser } from '../../services/matches'
import { createOrGetChat } from '../../services/chat'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { normalizeAvatarUrl, getFallbackAvatarUrl } from '../../utils'

interface MatchesScreenProps {
  onRefresh: () => void
  refreshing: boolean
  onChatPress?: (chatId: string, matchUser: MatchWithUser) => void
  onMatchRemoved?: () => void
  refreshTrigger?: number
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  onRefresh,
  refreshing,
  onChatPress,
  onMatchRemoved,
  refreshTrigger
}) => {
  const { user, loading: authLoading } = useAuth()
  const [matches, setMatches] = useState<MatchWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingMatches, setProcessingMatches] = useState<Set<string>>(new Set())

  // Load mutual matches from the database
  const loadMatches = useCallback(async () => {
    if (!user?.id) {
      setError('User information not available')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Loading mutual matches for:', user.id)
      const result = await getMutualMatches(user.id)

      if (result.success && result.matches) {
        setMatches(result.matches)
        console.log('✅ Loaded mutual matches:', result.matches.length)
      } else {
        console.warn('⚠️ No mutual matches found or error:', result.error)
        setMatches([])
        if (result.error) {
          setError(`Failed to load matches: ${result.error}`)
        }
      }
    } catch (err) {
      console.error('❌ Error loading matches:', err)
      setError('Failed to load matches. Please try again.')
      setMatches([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Load matches on mount and when user/refreshTrigger changes
  useEffect(() => {
    if (user?.id) {
      loadMatches()
      console.log('🔄 MatchesScreen refreshing due to trigger change:', refreshTrigger)
    }
  }, [user?.id, loadMatches, refreshTrigger])

  // Handle refresh
  const handleRefresh = async () => {
    await loadMatches()
    onRefresh() // Call parent refresh if needed
  }

  // Handle starting a chat with a match
  const handleStartChat = async (match: MatchWithUser) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found')
      return
    }

    const matchId = match.id
    setProcessingMatches(prev => new Set([...prev, matchId]))

    try {
      console.log(`💬 Starting chat with ${match.matched_user.name}`)

      // Create or get existing chat
      const chatResult = await createOrGetChat(user.id, match.matched_user.id)

      if (chatResult.success && chatResult.chat) {
        console.log('✅ Chat created/found successfully:', chatResult.chat.id)

        // Call parent callback to navigate to chat
        if (onChatPress) {
          onChatPress(chatResult.chat.id, match)
        } else {
          Alert.alert(
            'Chat Ready!',
            `Chat with ${match.matched_user.name} is ready. Navigate to the chat screen to start messaging.`
          )
        }
      } else {
        console.error('❌ Failed to create/get chat:', chatResult.error)
        Alert.alert('Error', `Failed to start chat: ${chatResult.error}`)
      }
    } catch (err) {
      console.error('❌ Error starting chat:', err)
      Alert.alert('Error', 'Failed to start chat. Please try again.')
    } finally {
      setProcessingMatches(prev => {
        const newSet = new Set(prev)
        newSet.delete(matchId)
        return newSet
      })
    }
  }

  // Handle removing a match with confirmation
  const handleRemoveMatch = async (match: MatchWithUser) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found')
      return
    }

    Alert.alert(
      'Remove Match',
      `Are you sure you want to remove ${match.matched_user.name} from your matches? They will appear in discovery again and won't know you unmatched.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const matchId = match.id
            setProcessingMatches(prev => new Set([...prev, matchId]))

            try {
              console.log('🗑️ Removing match:', match.matched_user.name, match.matched_user.id)
              const result = await removeMatch(user.id, match.matched_user.id)

              if (result.success) {
                console.log('✅ Match removal successful, updating UI...')

                // Remove the match from local state immediately for better UX
                setMatches(prev => prev.filter(m => m.id !== matchId))

                // Show success feedback
                Alert.alert(
                  'Match Removed',
                  `${match.matched_user.name} has been removed from your matches and will appear in discovery again.`
                )

                // Notify parent component that a match was removed (to refresh swipe page data)
                if (onMatchRemoved) {
                  console.log('📢 Notifying parent component about match removal...')
                  onMatchRemoved()
                }

                console.log('✅ Match removal completed successfully')
              } else {
                console.error('❌ Failed to remove match:', result.error)
                Alert.alert('Error', `Failed to remove match: ${result.error}`)
              }
            } catch (err) {
              console.error('❌ Error removing match:', err)
              Alert.alert('Error', 'Failed to remove match. Please try again.')
            } finally {
              setProcessingMatches(prev => {
                const newSet = new Set(prev)
                newSet.delete(matchId)
                return newSet
              })
            }
          }
        }
      ]
    )
  }

  // Render individual match item with rich profile display
  const renderMatch = ({ item: match }: { item: MatchWithUser }) => {
    const isProcessing = processingMatches.has(match.id)

    return (
      <View style={styles.matchCard}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: normalizeAvatarUrl(match.matched_user.profilePicture) ||
                   getFallbackAvatarUrl()
            }}
            style={styles.matchImage}
            contentFit="cover"
            onError={() => {
              console.log("🖼️ Match avatar failed to load:", match.matched_user.profilePicture)
            }}
          />

          {/* Match badge */}
          <View style={styles.matchBadge}>
            <Ionicons name="heart" size={12} color="#004D40" />
            <Text style={styles.matchBadgeText}>MATCH</Text>
          </View>
        </View>

        {/* Match Info */}
        <View style={styles.matchInfo}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchName}>
              {match.matched_user.name}
              {match.matched_user.age && `, ${match.matched_user.age}`}
            </Text>
            <Text style={styles.matchDate}>
              {new Date(match.created_at).toLocaleDateString()}
            </Text>
          </View>

          {/* User type */}
          <View style={styles.userTypeContainer}>
            <Ionicons
              name={match.matched_user.userType === 'provider' ? 'home' : 'search'}
              size={12}
              color="#44C76F"
            />
            <Text style={styles.userTypeText}>
              {match.matched_user.userType === 'provider' ? 'HAS A PLACE' : 'LOOKING FOR A PLACE'}
            </Text>
          </View>

          {/* Location */}
          {match.matched_user.location && (
            <Text style={styles.matchLocation} numberOfLines={1}>
              📍 {match.matched_user.location}
            </Text>
          )}

          {/* Bio preview */}
          {match.matched_user.bio && (
            <Text style={styles.matchBio} numberOfLines={2}>
              "{match.matched_user.bio}"
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => !isProcessing && handleStartChat(match)}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#004D40" />
            ) : (
              <Ionicons name="chatbubble" size={20} color="#004D40" />
            )}
            <Text style={styles.chatButtonText}>
              {isProcessing ? 'Loading...' : 'Chat'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => !isProcessing && handleRemoveMatch(match)}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Ionicons name="close" size={16} color="#DC2626" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Show loading state
  if (loading || authLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Finding your matches...</Text>
          <Text style={styles.loadingSubtext}>Loading people who liked you back 💕</Text>
        </View>
      </View>
    )
  }

  // Show error state
  if (error) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.errorContainer}
      >
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>TRY AGAIN</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  // Show empty state
  if (matches.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.emptyContainer}
      >
        <Text style={styles.emptyIcon}>💕</Text>
        <Text style={styles.emptyTitle}>No Matches Yet</Text>
        <Text style={styles.emptyText}>
          Keep swiping to find compatible roommates who will like you back!
        </Text>
        <Text style={styles.emptySubtext}>
          💡 Tip: Complete your profile with photos and preferences to get more matches
        </Text>
        <TouchableOpacity style={styles.discoverButton} activeOpacity={0.8}>
          <Text style={styles.discoverButtonText}>🔍 START SWIPING</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💕 Your Matches</Text>
        <Text style={styles.headerSubtitle}>
          {matches.length} roommate{matches.length !== 1 ? 's' : ''} who liked you back
        </Text>
      </View>

      {/* Matches Grid */}
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
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
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  matchCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#004D40',
    shadowColor: '#004D40',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  matchImage: {
    width: '100%',
    height: 120,
  },
  matchBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#44C76F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#004D40',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  matchBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#004D40',
  },
  matchInfo: {
    padding: 12,
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  matchName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#004D40',
    flex: 1,
  },
  matchDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  userTypeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#44C76F',
  },
  matchLocation: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  matchBio: {
    fontSize: 11,
    fontWeight: '500',
    color: '#004D40',
    fontStyle: 'italic',
    lineHeight: 14,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#44C76F',
    borderWidth: 2,
    borderColor: '#004D40',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginRight: 8,
    shadowColor: '#004D40',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#004D40',
  },
  removeButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 6,
    padding: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
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

export default MatchesScreen