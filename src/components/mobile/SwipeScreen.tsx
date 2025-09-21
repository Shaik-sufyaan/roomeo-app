// components/mobile/SwipeScreen.tsx - Mobile-native swipe/discover screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import type { User } from '../../types/user';
import { getDiscoverUsers } from '../../services/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const { width, height } = Dimensions.get('window');

interface SwipeScreenProps {
  user: User;
  onRefresh: () => void;
  refreshing: boolean;
}

interface ProfileCard {
  id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  imageUrl: string;
  userType: string;
}

// Mock data for demonstration
const mockProfiles: ProfileCard[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    age: 22,
    bio: 'CS student at GSU. Love cooking and hiking! Looking for a clean, friendly roommate.',
    location: 'Atlanta, GA',
    imageUrl: 'https://via.placeholder.com/300x400/44C76F/004D40?text=SC',
    userType: 'seeker',
  },
  {
    id: '2',
    name: 'Mike Johnson',
    age: 24,
    bio: 'Recent grad working downtown. Have a 2BR apartment near MARTA.',
    location: 'Atlanta, GA',
    imageUrl: 'https://via.placeholder.com/300x400/44C76F/004D40?text=MJ',
    userType: 'provider',
  },
];

export const SwipeScreen: React.FC<SwipeScreenProps> = ({
  user,
  onRefresh,
  refreshing,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentProfile = profiles[currentIndex];

  // Load real users from Supabase
  const loadProfiles = async () => {
    if (!user?.id || !user?.userType) {
      setError('User information not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading discover users for:', user.id, user.userType);
      const discoverUsers = await getDiscoverUsers(user.id, user.userType, 20);

      // Transform Supabase user data to ProfileCard format
      const transformedProfiles: ProfileCard[] = discoverUsers.map(dbUser => ({
        id: dbUser.id,
        name: dbUser.name || 'Unknown User',
        age: dbUser.age || 25,
        bio: dbUser.bio || 'No bio available',
        location: dbUser.location || 'Location not specified',
        imageUrl: dbUser.profilepicture || `https://via.placeholder.com/300x400/44C76F/004D40?text=${dbUser.name?.charAt(0) || 'U'}`,
        userType: dbUser.usertype || 'unknown',
      }));

      setProfiles(transformedProfiles);
      console.log('✅ Loaded profiles:', transformedProfiles.length);
    } catch (error) {
      console.error('❌ Error loading profiles:', error);
      setError('Failed to load profiles. Please try again.');
      // Fallback to mock data if Supabase fails
      setProfiles(mockProfiles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [user?.id, user?.userType]);

  const handleRefresh = async () => {
    await loadProfiles();
    onRefresh(); // Call parent refresh if needed
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      Alert.alert('Match!', `You liked ${currentProfile.name}`);
    }

    // Move to next profile
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Finding potential roommates...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.emptyContainer}
      >
        <Text style={styles.errorTitle}>⚠️ Oops!</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>TRY AGAIN</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Show empty state
  if (!currentProfile || profiles.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.emptyContainer}
      >
        <Text style={styles.emptyTitle}>🎉 No More Profiles</Text>
        <Text style={styles.emptySubtitle}>
          {profiles.length === 0
            ? 'No potential roommates found. Try adjusting your preferences!'
            : 'Check back later for new potential roommates!'
          }
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>REFRESH</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Profile Image */}
          <Image
            source={{ uri: currentProfile.imageUrl }}
            style={styles.profileImage}
            resizeMode="cover"
          />

          {/* Profile Info Overlay */}
          <View style={styles.profileInfoOverlay}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {currentProfile.name}, {currentProfile.age}
              </Text>
              <Text style={styles.profileLocation}>📍 {currentProfile.location}</Text>
              <Text style={styles.profileBio}>{currentProfile.bio}</Text>
              <View style={styles.profileTypeContainer}>
                <Text style={styles.profileType}>
                  {currentProfile.userType === 'seeker' ? '🏠 Looking for Place' : '👥 Has Place'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleSwipe('left')}
        >
          <Text style={styles.actionButtonText}>❌</Text>
          <Text style={styles.actionButtonLabel}>PASS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('right')}
        >
          <Text style={styles.actionButtonText}>💚</Text>
          <Text style={styles.actionButtonLabel}>LIKE</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Swipe or tap buttons to discover compatible roommates
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    width: width - 40,
    height: height * 0.65,
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
  },
  profileImage: {
    width: '100%',
    height: '70%',
  },
  profileInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 77, 64, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileInfo: {
    gap: 6,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
  },
  profileLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#44C76F',
  },
  profileBio: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    lineHeight: 20,
    marginTop: 4,
  },
  profileTypeContainer: {
    marginTop: 8,
  },
  profileType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#44C76F',
    backgroundColor: 'rgba(68, 199, 111, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingVertical: 20,
    gap: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
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
  actionButtonText: {
    fontSize: 24,
  },
  actionButtonLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#004D40',
    marginTop: 2,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  instructionsText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
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
});