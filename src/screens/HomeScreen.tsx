// screens/HomeScreen.tsx - Mobile-native main app screen (Type C conversion)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AppNavigator } from '../components/mobile/AppNavigator';


export const HomeScreen: React.FC = () => {
  const { user, loading, error: authError, sessionValid, logout, updateUserProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // Trigger refresh for current screen
    // Implementation depends on which screen is active
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Handle profile updates
  const handleUpdateProfile = async (updatedData: any) => {
    if (updateUserProfile) {
      await updateUserProfile(updatedData);
    }
  };

  // Show loading state
  if (loading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  // Show error state
  if (authError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Configuration Error</Text>
          <Text style={styles.errorMessage}>{authError}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => {
              // In mobile, we'd restart the app or trigger a reload
              Alert.alert('Error', 'Please restart the app');
            }}
          >
            <Text style={styles.errorButtonText}>RESTART APP</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If no user, this screen shouldn't be shown (handled by AppNavigator)
  if (!user || !sessionValid) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />

      {/* Use AppNavigator for complete mobile navigation */}
      <AppNavigator
        user={user}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onLogout={handleLogout}
        onUpdateProfile={handleUpdateProfile}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#991B1B',
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
});