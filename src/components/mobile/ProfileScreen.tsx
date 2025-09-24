// components/mobile/ProfileScreen.tsx - Mobile-native profile screen with service integration
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import type { User } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import { getMutualMatches } from '../../services/matches';
import { getUserChats } from '../../services/chat';
import { getCompleteProfile } from '../../services/profile';
import { updateUserProfile } from '../../services/auth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProfileScreenProps {
  user: User;
  onRefresh: () => void;
  refreshing: boolean;
  onLogout: () => void;
  onEditProfile?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onRefresh,
  refreshing,
  onLogout,
  onEditProfile,
}) => {
  const { user: authUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileVisible, setProfileVisible] = useState(user.profileVisible ?? true);
  const [profileStats, setProfileStats] = useState({
    profileViews: 0,
    matches: 0,
    chats: 0,
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Load real profile statistics
  const loadProfileStats = async () => {
    if (!authUser?.id) return;

    setLoading(true);
    try {
      console.log('🔄 Loading profile statistics for:', authUser.id);

      // Get match count
      const matchesResult = await getMutualMatches(authUser.id);
      const matchCount = matchesResult.success ? matchesResult.matches?.length || 0 : 0;

      // Get chat count
      const chatsResult = await getUserChats(authUser.id);
      const chatCount = chatsResult.length;

      // Get profile completion data (includes view info)
      const profileResult = await getCompleteProfile(authUser.id);
      const profileViews = profileResult.completionStatus?.completionPercentage || 0;

      setProfileStats({
        profileViews,
        matches: matchCount,
        chats: chatCount,
      });

      console.log('✅ Profile stats loaded:', { profileViews, matches: matchCount, chats: chatCount });
    } catch (error) {
      console.error('❌ Error loading profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileStats();
  }, [authUser?.id]);

  const profileStatsArray = [
    { label: 'Profile Completion', value: `${profileStats.profileViews}%` },
    { label: 'Matches', value: profileStats.matches.toString() },
    { label: 'Chats', value: profileStats.chats.toString() },
  ];

  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
    } else {
      Alert.alert('Edit Profile', 'Profile editing will be implemented soon!');
    }
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings page will be implemented soon!');
  };

  const handleUpgrade = () => {
    Alert.alert('Upgrade', 'Upgrade functionality will be implemented soon!');
  };

  // Handle profile visibility toggle with real database update
  const handleToggleProfileVisible = async (newValue: boolean) => {
    if (!authUser?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setUpdating(true);
    try {
      console.log('🔄 Updating profile visibility:', newValue);

      const updateResult = await updateUserProfile(authUser.id, {
        profileVisible: newValue
      });

      if (updateResult) {
        setProfileVisible(newValue);
        console.log('✅ Profile visibility updated');
      } else {
        Alert.alert('Error', 'Failed to update profile visibility');
      }
    } catch (error) {
      console.error('❌ Error updating profile visibility:', error);
      Alert.alert('Error', 'Failed to update profile visibility');
    } finally {
      setUpdating(false);
    }
  };

  // Handle refresh with real data reload
  const handleRefresh = async () => {
    await loadProfileStats();
    onRefresh();
  };

  const menuItems = [
    {
      title: 'Edit Profile',
      icon: '✏️',
      onPress: handleEditProfile,
    },
    {
      title: 'Account Settings',
      icon: '⚙️',
      onPress: handleSettings,
    },
    {
      title: 'Upgrade Account',
      icon: '⭐',
      onPress: handleUpgrade,
    },
    {
      title: 'Help & Support',
      icon: '❓',
      onPress: () => Alert.alert('Help', 'Support coming soon!'),
    },
    {
      title: 'Privacy Policy',
      icon: '🔒',
      onPress: () => Alert.alert('Privacy', 'Privacy policy will be shown here'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing || loading} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{
            uri: user.profilePicture || 'https://via.placeholder.com/120x120/44C76F/004D40?text=U',
          }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>

        {user.userType && (
          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeText}>
              {user.userType === 'seeker' ? '🏠 Looking for Place' : '👥 Has Place'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>EDIT PROFILE</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Stats */}
      <View style={styles.statsContainer}>
        {loading ? (
          <View style={styles.statsLoading}>
            <LoadingSpinner />
            <Text style={styles.statsLoadingText}>Loading stats...</Text>
          </View>
        ) : (
          profileStatsArray.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>About Me</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Age:</Text>
          <Text style={styles.infoValue}>{user.age || 'Not set'}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue}>{user.location || 'Not set'}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Budget:</Text>
          <Text style={styles.infoValue}>
            {user.budget ? `$${user.budget}/month` : 'Not set'}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Bio:</Text>
          <Text style={styles.infoValue}>{user.bio || 'No bio yet'}</Text>
        </View>
      </View>

      {/* Privacy Settings */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Privacy & Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>Profile Visible</Text>
            <Text style={styles.settingSubtitle}>Show your profile to others</Text>
          </View>
          <Switch
            value={profileVisible}
            onValueChange={handleToggleProfileVisible}
            trackColor={{ false: '#E5E7EB', true: '#44C76F' }}
            thumbColor={profileVisible ? '#004D40' : '#9CA3AF'}
            disabled={updating}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingSubtitle}>Get notified of new matches</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E5E7EB', true: '#44C76F' }}
            thumbColor={notificationsEnabled ? '#004D40' : '#9CA3AF'}
          />
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>SIGN OUT</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfoContainer}>
        <Text style={styles.appInfoText}>Roomeo v1.0.0</Text>
        <Text style={styles.appInfoText}>© 2024 Roomeo. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#44C76F',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  userTypeContainer: {
    backgroundColor: 'rgba(68, 199, 111, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#004D40',
  },
  editButton: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#004D40',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#004D40',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statsLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  statsLoadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004D40',
    flex: 1,
    textAlign: 'right',
  },
  settingsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004D40',
  },
  settingSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: 'white',
    marginTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004D40',
  },
  menuArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
  },
  logoutContainer: {
    padding: 20,
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#991B1B',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },
  appInfoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  appInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});