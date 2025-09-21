// components/mobile/MatchesScreen.tsx - Mobile-native matches screen with real data
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import type { User } from '../../types/user';
import { getMutualMatches, type MatchWithUser } from '../../services/matches';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface MatchesScreenProps {
  user: User;
  onRefresh: () => void;
  refreshing: boolean;
  onMatchPress?: (matchId: string, match: MatchWithUser) => void;
}

// Using MatchWithUser from services/matches instead of local interface

// Mock data
const mockMatches: Match[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    age: 22,
    imageUrl: 'https://via.placeholder.com/60x60/44C76F/004D40?text=SC',
    lastMessage: 'Hey! Would love to chat about the apartment',
    lastMessageTime: '2 min ago',
    unreadCount: 2,
  },
  {
    id: '2',
    name: 'Mike Johnson',
    age: 24,
    imageUrl: 'https://via.placeholder.com/60x60/44C76F/004D40?text=MJ',
    lastMessage: 'That sounds perfect!',
    lastMessageTime: '1 hour ago',
  },
  {
    id: '3',
    name: 'Emily Davis',
    age: 23,
    imageUrl: 'https://via.placeholder.com/60x60/44C76F/004D40?text=ED',
    lastMessage: 'When can we schedule a tour?',
    lastMessageTime: '3 hours ago',
    unreadCount: 1,
  },
];

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  user,
  onRefresh,
  refreshing,
  onMatchPress,
}) => {
  const [matches, setMatches] = useState<MatchWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real mutual matches from Supabase
  const loadMatches = async () => {
    if (!user?.id) {
      setError('User information not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading mutual matches for:', user.id);
      const result = await getMutualMatches(user.id);

      if (result.success && result.matches) {
        setMatches(result.matches);
        console.log('✅ Loaded mutual matches:', result.matches.length);
      } else {
        console.warn('⚠️ No mutual matches found or error:', result.error);
        setMatches([]);
        if (result.error) {
          setError(`Failed to load matches: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading matches:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setError('Failed to load matches. Please try again.');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [user?.id]);

  const handleRefresh = async () => {
    await loadMatches();
    onRefresh(); // Call parent refresh if needed
  };

  const handleMatchPress = (match: MatchWithUser) => {
    if (onMatchPress) {
      onMatchPress(match.id, match);
    } else {
      Alert.alert(
        'Start Chat',
        `Start a conversation with ${match.matched_user.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Chat', onPress: () => console.log(`Starting chat with ${match.matched_user.name}`) },
        ]
      );
    }
  };

  const renderMatch = ({ item }: { item: MatchWithUser }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => handleMatchPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: item.matched_user.profilePicture ||
               `https://via.placeholder.com/60x60/44C76F/004D40?text=${item.matched_user.name?.charAt(0) || 'U'}`
        }}
        style={styles.matchImage}
      />

      <View style={styles.matchInfo}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>
            {item.matched_user.name}, {item.matched_user.age || 25}
          </Text>
          <Text style={styles.matchTime}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.matched_user.bio || "Hey! I saw your profile and think we'd be great roommates!"}
        </Text>

        <Text style={styles.matchLocation} numberOfLines={1}>
          📍 {item.matched_user.location || 'Location not specified'}
        </Text>
      </View>

      <View style={styles.matchBadge}>
        <Text style={styles.matchBadgeText}>🎉 Match!</Text>
      </View>
    </TouchableOpacity>
  );

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Finding your matches...</Text>
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
  if (matches.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.emptyContainer}
      >
        <Text style={styles.emptyTitle}>💕 No Matches Yet</Text>
        <Text style={styles.emptySubtitle}>
          Keep swiping to find compatible roommates!
        </Text>
        <TouchableOpacity style={styles.discoverButton}>
          <Text style={styles.discoverButtonText}>START SWIPING</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Matches</Text>
        <Text style={styles.headerSubtitle}>
          {matches.length} potential roommate{matches.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Matches List */}
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
    padding: 16,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#004D40',
    shadowColor: '#004D40',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  matchImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#44C76F',
  },
  matchInfo: {
    flex: 1,
    marginLeft: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
  },
  matchTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  lastMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
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
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
  },
  matchLocation: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  matchBadge: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#004D40',
  },
  matchBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#004D40',
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