// components/mobile/AppNavigator.tsx - Main navigation container for mobile app
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SwipeScreen } from './SwipeScreen';
import { MatchesScreen } from './MatchesScreen';
import { ChatScreen } from './ChatScreen';
import { ProfileScreen } from './ProfileScreen';
import { ExpensesScreen } from './ExpensesScreen';
import { MarketplaceScreen } from './MarketplaceScreen';
import { ChatDetailScreen } from './ChatDetailScreen';
import { ProfileEditScreen } from './ProfileEditScreen';
import { TabNavigation } from './TabNavigation';
import { ProfileHeader } from './ProfileHeader';
import { createOrGetChat } from '../../services/chat';
import type { User } from '../../types/user';

const { width } = Dimensions.get('window');

export type ScreenType = 'swipe' | 'matches' | 'chat' | 'expenses' | 'marketplace' | 'profile' | 'chat-detail' | 'profile-edit';

interface AppNavigatorProps {
  user: User;
  onRefresh: () => void;
  refreshing: boolean;
  onLogout: () => void;
  onUpdateProfile: (updatedUser: Partial<User>) => Promise<void>;
}

interface NavigationState {
  currentScreen: ScreenType;
  previousScreen?: ScreenType;
  screenParams?: any;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({
  user,
  onRefresh,
  refreshing,
  onLogout,
  onUpdateProfile,
}) => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: 'swipe',
  });

  const [slideAnim] = useState(new Animated.Value(0));

  const navigateToScreen = (screen: ScreenType, params?: any) => {
    const isDetailScreen = screen === 'chat-detail' || screen === 'profile-edit';

    if (isDetailScreen) {
      // Slide in from right for detail screens
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset slide animation for main screens
      slideAnim.setValue(0);
    }

    setNavigationState({
      currentScreen: screen,
      previousScreen: navigationState.currentScreen,
      screenParams: params,
    });
  };

  const goBack = () => {
    if (navigationState.previousScreen) {
      // Slide out to right for detail screens
      if (navigationState.currentScreen === 'chat-detail' || navigationState.currentScreen === 'profile-edit') {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setNavigationState({
            currentScreen: navigationState.previousScreen!,
          });
        });
      } else {
        setNavigationState({
          currentScreen: navigationState.previousScreen,
        });
      }
    }
  };

  const handleChatPress = (chatId: string, chatPartner: any) => {
    navigateToScreen('chat-detail', { chatId, chatPartner });
  };

  const handleMatchPress = async (matchId: string, match: any) => {
    try {
      // Get or create a chat between current user and matched user
      const targetUserId = match.matched_user?.id || match.target_user_id;

      if (!targetUserId) {
        console.error('No target user ID found in match');
        return;
      }

      console.log('🔄 Creating or getting chat between', user.id, 'and', targetUserId);
      const result = await createOrGetChat(user.id, targetUserId);

      if (result.success && result.chat) {
        const chatPartner = {
          id: targetUserId,
          name: match.matched_user?.name || match.name,
          imageUrl: match.matched_user?.profilePicture || match.imageUrl,
          isOnline: false, // TODO: Add real online status
        };
        navigateToScreen('chat-detail', { chatId: result.chat.id, chatPartner });
      } else {
        console.error('Failed to create/get chat:', result.error);
        // Fallback to previous behavior
        const chatPartner = {
          id: targetUserId,
          name: match.matched_user?.name || match.name,
          imageUrl: match.matched_user?.profilePicture || match.imageUrl,
          isOnline: false,
        };
        navigateToScreen('chat-detail', { chatId: `match-${matchId}`, chatPartner });
      }
    } catch (error) {
      console.error('Error handling match press:', error);
    }
  };

  const handleEditProfile = () => {
    navigateToScreen('profile-edit');
  };

  const handleChangePhoto = () => {
    // TODO: Implement photo selection
    console.log('Change photo functionality will be implemented');
  };

  const renderMainScreen = () => {
    switch (navigationState.currentScreen) {
      case 'swipe':
        return (
          <SwipeScreen
            user={user}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        );
      case 'matches':
        return (
          <MatchesScreen
            user={user}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onMatchPress={handleMatchPress}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            user={user}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onChatPress={handleChatPress}
          />
        );
      case 'expenses':
        return (
          <ExpensesScreen
            user={user}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        );
      case 'marketplace':
        return (
          <MarketplaceScreen
            user={user}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onLogout={onLogout}
            onEditProfile={handleEditProfile}
          />
        );
      default:
        return (
          <SwipeScreen
            user={user}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        );
    }
  };

  const renderDetailScreen = () => {
    switch (navigationState.currentScreen) {
      case 'chat-detail':
        return (
          <ChatDetailScreen
            chatId={navigationState.screenParams?.chatId}
            chatPartner={navigationState.screenParams?.chatPartner}
            onBack={goBack}
          />
        );
      case 'profile-edit':
        return (
          <ProfileEditScreen
            user={user}
            onSave={onUpdateProfile}
            onBack={goBack}
            onChangePhoto={handleChangePhoto}
          />
        );
      default:
        return null;
    }
  };

  const isDetailScreen = navigationState.currentScreen === 'chat-detail' || navigationState.currentScreen === 'profile-edit';
  const showTabNavigation = !isDetailScreen;
  const showProfileHeader = !isDetailScreen;

  return (
    <View style={styles.container}>
      {/* Main Screen Container */}
      <View style={styles.mainContainer}>
        {showProfileHeader && (
          <ProfileHeader
            user={user}
            onMenuPress={() => {}} // TODO: Implement menu functionality
          />
        )}

        <View style={styles.screenContainer}>
          {renderMainScreen()}
        </View>

        {showTabNavigation && (
          <TabNavigation
            activeTab={navigationState.currentScreen}
            onTabPress={navigateToScreen}
          />
        )}
      </View>

      {/* Detail Screen Overlay */}
      {isDetailScreen && (
        <Animated.View
          style={[
            styles.detailScreenContainer,
            {
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [width, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {renderDetailScreen()}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  mainContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  detailScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F2F5F1',
    zIndex: 10,
  },
});