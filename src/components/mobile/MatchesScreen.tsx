// components/mobile/MatchesScreen.tsx - Mobile-native matches screen
import React, { useState } from 'react';
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

interface MatchesScreenProps {
  user: User;
  onRefresh: () => void;
  refreshing: boolean;
  onMatchPress?: (matchId: string, match: Match) => void;
}

interface Match {
  id: string;
  name: string;
  age: number;
  imageUrl: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

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
  const [matches] = useState(mockMatches);

  const handleMatchPress = (match: Match) => {
    if (onMatchPress) {
      onMatchPress(match.id, match);
    } else {
      Alert.alert(
        'Start Chat',
        `Start a conversation with ${match.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Chat', onPress: () => console.log(`Starting chat with ${match.name}`) },
        ]
      );
    }
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => handleMatchPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.matchImage} />

      <View style={styles.matchInfo}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>{item.name}, {item.age}</Text>
          {item.lastMessageTime && (
            <Text style={styles.matchTime}>{item.lastMessageTime}</Text>
          )}
        </View>

        {item.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        )}
      </View>

      {item.unreadCount && item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (matches.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
});