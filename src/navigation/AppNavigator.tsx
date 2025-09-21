import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

// Placeholder screens - will be replaced with actual components
const SwipeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>🔥 Swipe Screen</Text>
    <Text>Coming Soon: Roommate matching interface</Text>
  </View>
);

const MatchesScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>💕 Matches Screen</Text>
    <Text>Coming Soon: Your matches and connections</Text>
  </View>
);

const ChatScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>💬 Chat Screen</Text>
    <Text>Coming Soon: Real-time messaging</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>👤 Profile Screen</Text>
    <Text>Coming Soon: Edit your profile</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main tab navigator for authenticated users
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Swipe"
        component={SwipeScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: () => <Text>🔥</Text>,
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: () => <Text>💕</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: () => <Text>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Root navigator that handles auth state
export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is authenticated - show main app
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        ) : (
          // User not authenticated - show auth screen
          <Stack.Screen name="Auth" component={require('../screens/auth/TestAuthScreen').default} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};