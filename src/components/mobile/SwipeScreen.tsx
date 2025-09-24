/**
 * SwipeScreen - Fully integrated mobile swipe screen with real services
 * Complete integration with useAuth, getDiscoverUsers, match logic, and LockedSwipeScreen
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

import { useAuth } from '../../hooks/useAuth'
import { getDiscoverUsers } from '../../services/supabase'
import { saveMatch, checkMutualMatch } from '../../services/matches'
import { createOrGetChatWith } from '../../services/chat'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import LockedSwipeScreen from './LockedSwipeScreen'
import { normalizeAvatarUrl, getFallbackAvatarUrl } from '../../utils'

const { width, height } = Dimensions.get('window')

interface SwipeScreenProps {
  onRefresh: () => void
  refreshing: boolean
  onUpgrade?: () => void
  onNavigateToSettings?: () => void
  refreshTrigger?: number
}

interface ProfileData {
  id: string
  name: string
  age?: number
  bio?: string
  location?: string
  profilepicture?: string
  usertype?: 'seeker' | 'provider'
  preferences?: {
    smoking: boolean
    drinking: boolean
    vegetarian: boolean
    pets: boolean
  }
  profilevisible?: boolean
}

export const SwipeScreen: React.FC<SwipeScreenProps> = ({
  onRefresh,
  refreshing,
  onUpgrade,
  onNavigateToSettings,
  refreshTrigger
}) => {
  const { user, loading: authLoading } = useAuth()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingSwipe, setProcessingSwipe] = useState(false)

  // Check if swipe page should be locked for quick_access users
  const isSwipeLocked = user?.userType === 'quick_access'

  // Get current profile
  const currentProfile = profiles[currentIndex]

  // Handle upgrade flow for locked users
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else if (onNavigateToSettings) {
      onNavigateToSettings()
    } else {
      console.log("🔄 User wants to upgrade from Quick Access")
    }
  }

  // Fetch opposite type users with comprehensive filtering
  const fetchProfiles = useCallback(async () => {
    if (!user?.id) {
      setError("User not found")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Check if current user's profile is hidden
      if (!user.profileVisible) {
        console.log('User profile is hidden, blocking discovery access')
        setError('PROFILE_HIDDEN')
        setLoading(false)
        return
      }

      // Check user type
      if (!user.userType || user.userType === 'quick_access') {
        if (user.userType === 'quick_access') {
          // This will be handled by the LockedSwipeScreen component
          setLoading(false)
          return
        }
        console.warn('UserType not available or invalid')
        setError('Unable to determine user type. Please complete your profile setup.')
        setLoading(false)
        return
      }

      console.log('🔄 Fetching discover users for:', user.id, user.userType)

      // Get users from the discover service
      const discoveredUsers = await getDiscoverUsers(user.id, user.userType, 50)

      if (!discoveredUsers || discoveredUsers.length === 0) {
        setProfiles([])
        setLoading(false)
        return
      }

      // Filter out users already liked (to avoid showing them again)
      // This is handled by the backend but we can add extra filtering here if needed
      let filteredProfiles = discoveredUsers.filter(profile =>
        profile.profilevisible !== false && // Only visible profiles
        profile.age !== null && // Complete profiles only
        profile.usertype !== null
      )

      console.log(`✅ Loaded ${filteredProfiles.length} profiles for swiping`)
      setProfiles(filteredProfiles)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load profiles on mount and when user/refreshTrigger changes
  useEffect(() => {
    if (user?.id && !isSwipeLocked) {
      // Clear existing state first
      setProfiles([])
      setCurrentIndex(0)
      setError(null)
      // Fetch fresh data
      fetchProfiles()
      console.log('🔄 SwipeScreen refreshing due to trigger change:', refreshTrigger)
    }
  }, [user, fetchProfiles, refreshTrigger])

  // Handle swipe action with full integration
  const handleSwipe = async (liked: boolean) => {
    if (!currentProfile || !user?.id || processingSwipe) return

    setProcessingSwipe(true)

    try {
      // Always move to next profile first (better UX)
      console.log(liked ? "👍 Liked!" : "👎 Passed!")
      setCurrentIndex((prev) => prev + 1)

      if (liked) {
        // Save the like to database
        console.log('💕 Saving like to database...')
        const matchResult = await saveMatch(user.id, currentProfile.id, 'like')

        if (matchResult.success) {
          console.log('✅ Like saved successfully!')

          // Check if it's a mutual match
          if (matchResult.isMutualMatch) {
            console.log('🎉 MUTUAL MATCH DETECTED!')

            // Create or get existing chat
            const chatResult = await createOrGetChatWith(user.id, currentProfile.id)

            if (chatResult.success) {
              console.log('💬 Chat created/found for mutual match')
            }

            // Show match notification
            Alert.alert(
              '🎉 It\'s a Match!',
              `You and ${currentProfile.name} liked each other! You can now chat.`,
              [{ text: 'Awesome!', style: 'default' }]
            )
          }
        } else {
          console.error('❌ Failed to save like:', matchResult.error)
        }
      }
      // Note: We don't save "passes" to the database to keep it clean
    } catch (err) {
      console.error('❌ Error processing swipe:', err)
    } finally {
      setProcessingSwipe(false)
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    await fetchProfiles()
    onRefresh() // Call parent refresh if needed
  }

  // Show locked page for quick_access users
  if (isSwipeLocked) {
    return (
      <LockedSwipeScreen
        onUpgrade={handleUpgrade}
        userType={user?.userType || ''}
        lockReason="upgrade_required"
      />
    )
  }

  // Show loading state
  if (loading || authLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Finding your perfect roommates...</Text>
          <Text style={styles.loadingSubtext}>Looking for compatible living partners 💕</Text>
        </View>
      </View>
    )
  }

  // Error state with specific handling
  if (error) {
    const isProfileHidden = error === 'PROFILE_HIDDEN'
    const isProfileSetupError = error.includes('user type') || error.includes('profile setup')

    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.errorContainer}
      >
        <Text style={styles.errorIcon}>
          {isProfileSetupError ? '👤' : isProfileHidden ? '🔒' : '⚠️'}
        </Text>
        <Text style={styles.errorTitle}>
          {isProfileSetupError ? 'Profile Setup Needed' : isProfileHidden ? 'Profile Hidden' : 'Oops!'}
        </Text>

        {isProfileHidden ? (
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>
              Your profile is currently hidden from discovery. To browse and match with others, you need to make your profile visible first.
            </Text>
            <Text style={styles.errorNote}>
              📌 Go to Settings → Privacy & Security → Profile Visibility to unhide your profile.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (onNavigateToSettings) {
                  onNavigateToSettings()
                } else {
                  Alert.alert("Settings", "Please go to Settings → Privacy & Security to unhide your profile")
                }
              }}
            >
              <Text style={styles.actionButtonText}>🔒 Go to Settings</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>{error}</Text>
            {isProfileSetupError ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.errorNote}>Redirecting to profile setup...</Text>
                <ActivityIndicator size="small" color="#004D40" style={{ marginTop: 8 }} />
              </View>
            ) : (
              <TouchableOpacity style={styles.actionButton} onPress={fetchProfiles}>
                <Text style={styles.actionButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    )
  }

  // No more profiles state
  if (currentIndex >= profiles.length || profiles.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.emptyContainer}
      >
        <Text style={styles.emptyIcon}>🏠</Text>
        <Text style={styles.emptyTitle}>No More Profiles</Text>
        <Text style={styles.emptyText}>Check back later for new potential roommates!</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            setCurrentIndex(0)
            fetchProfiles()
          }}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header with profile counter */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💕 Find Your Roommate</Text>
        <Text style={styles.headerSubtitle}>Swipe to discover compatible living partners</Text>
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1} OF {profiles.length}
          </Text>
        </View>
      </View>

      {/* Main swipe content */}
      <View style={styles.swipeContainer}>
        {/* Profile Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* Profile Image */}
            <Image
              source={{
                uri: normalizeAvatarUrl(currentProfile.profilepicture) || getFallbackAvatarUrl()
              }}
              style={styles.profileImage}
              contentFit="cover"
              onError={() => {
                console.log("🖼️ Profile image failed to load:", currentProfile.profilepicture)
              }}
            />

            {/* Profile Info Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.profileOverlay}
            >
              <Text style={styles.profileName}>
                {currentProfile.name}, {currentProfile.age || 25}
              </Text>
              <Text style={styles.profileType}>
                {currentProfile.usertype === "provider" ? "HAS A PLACE" : "LOOKING FOR A PLACE"}
              </Text>
              {currentProfile.location && (
                <Text style={styles.profileLocation}>📍 {currentProfile.location}</Text>
              )}
            </LinearGradient>
          </View>

          {/* Profile Details Below Card */}
          <View style={styles.profileDetails}>
            {/* Preferences */}
            <View style={styles.preferencesContainer}>
              <View style={styles.preferenceItem}>
                <Ionicons
                  name={currentProfile.preferences?.smoking ? "close-circle" : "checkmark-circle"}
                  size={16}
                  color={currentProfile.preferences?.smoking ? "#EF4444" : "#44C76F"}
                />
                <Text style={styles.preferenceText}>
                  {currentProfile.preferences?.smoking ? "SMOKER" : "NON-SMOKER"}
                </Text>
              </View>

              <View style={styles.preferenceItem}>
                <Ionicons name="heart" size={16} color="#44C76F" />
                <Text style={styles.preferenceText}>
                  {currentProfile.preferences?.pets ? "PET-FRIENDLY" : "NO PETS"}
                </Text>
              </View>

              {currentProfile.preferences?.vegetarian && (
                <View style={styles.preferenceItem}>
                  <Text style={{ fontSize: 16, color: '#44C76F' }}>🌱</Text>
                  <Text style={styles.preferenceText}>VEGETARIAN</Text>
                </View>
              )}

              {currentProfile.preferences?.drinking && (
                <View style={styles.preferenceItem}>
                  <Text style={{ fontSize: 16, color: '#44C76F' }}>🍺</Text>
                  <Text style={styles.preferenceText}>DRINKS</Text>
                </View>
              )}
            </View>

            {/* Bio */}
            {currentProfile.bio && (
              <View style={styles.bioContainer}>
                <Text style={styles.bioText}>{currentProfile.bio}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => !processingSwipe && handleSwipe(false)}
            disabled={processingSwipe}
          >
            {processingSwipe ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Ionicons name="close" size={28} color="#DC2626" />
                <Text style={styles.actionLabel}>PASS</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => !processingSwipe && handleSwipe(true)}
            disabled={processingSwipe}
          >
            {processingSwipe ? (
              <ActivityIndicator size="small" color="#16A34A" />
            ) : (
              <>
                <Ionicons name="heart" size={28} color="#16A34A" />
                <Text style={styles.actionLabel}>LIKE</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Swipe or tap buttons to discover compatible roommates
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(0, 77, 64, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  counterContainer: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#004D40',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#004D40',
  },
  swipeContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    width: width - 40,
    height: height * 0.55,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#004D40',
    shadowColor: '#004D40',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#44C76F',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  profileDetails: {
    width: '100%',
    gap: 12,
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  preferenceText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#004D40',
  },
  bioContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#44C76F',
    paddingLeft: 12,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#004D40',
  },
  bioText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#004D40',
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
    marginBottom: 20,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  passButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  likeButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
    shadowColor: '#16A34A',
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#004D40',
    marginTop: 4,
  },
  instructionsContainer: {
    alignItems: 'center',
  },
  instructionsText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Loading states
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

  // Error states
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
    color: '#004D40',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorContent: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  errorNote: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 77, 64, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#004D40',
  },
  actionButtonText: {
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
    fontSize: 32,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(0, 77, 64, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: '#004D40',
    shadowColor: '#004D40',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  refreshButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
  },
})

export default SwipeScreen