// screens/MainApp.tsx - Mobile-native main app entry point (Type C conversion)
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AuthScreen } from './AuthScreen';
import { HomeScreen } from './HomeScreen';
import { LandingScreen } from './LandingScreen';

export type AppPage = 'landing' | 'auth' | 'home' | 'profile-setup' | 'user-type';

export const MainApp: React.FC = () => {
  const { user, loading, logout, error: authError, sessionValid, updateUserProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  // Debug logging
  useEffect(() => {
    console.log('🔍 Mobile App State:', {
      user: user ? {
        id: user.id,
        name: user.name,
        age: user.age,
        userType: user.userType,
        preferences: !!user.preferences,
        profilePicture: user.profilePicture,
      } : null,
      loading,
      currentPage,
      authError,
      sessionValid,
    });
  }, [user, loading, currentPage, authError, sessionValid]);

  // Handle user authentication state and routing
  useEffect(() => {
    console.log('🔄 Checking mobile user flow...', {
      user: !!user,
      loading,
      currentPage,
      authError,
      sessionValid,
    });

    // Don't make routing decisions while still loading
    if (loading) {
      console.log('⏳ Still loading, skipping routing decisions');
      return;
    }

    if (user && sessionValid) {
      console.log('✅ User is authenticated with valid session');

      // Only redirect if we're on landing or auth pages
      if (currentPage === 'landing' || currentPage === 'auth') {
        console.log('🔍 Checking profile completion...');

        // Check if profile setup is needed (age, preferences, AND userType are required)
        if (!user.age || !user.preferences || !user.userType) {
          console.log('🔄 Profile setup needed - will handle in onboarding');
          console.log('   - Missing age:', !user.age);
          console.log('   - Missing preferences:', !user.preferences);
          console.log('   - Missing userType:', !user.userType);

          // For now, go to main app and let it handle the profile setup flow
          // In a future iteration, we'll add dedicated onboarding screens
          setCurrentPage('home');
          return;
        }

        // User is fully set up - go to main app
        console.log('✅ User fully set up - redirecting to main app');
        setCurrentPage('home');
      }
    } else if (!authError && !user) {
      console.log('❌ No user and not loading - checking if we need to redirect to landing');
      // If user logs out or is not authenticated, go back to landing
      if (currentPage !== 'landing' && currentPage !== 'auth') {
        console.log('🔄 Redirecting to landing page');
        setCurrentPage('landing');
      }
    }
  }, [user, loading, currentPage, authError, sessionValid]);

  const handleGoToAuth = (mode: 'signup' | 'signin' = 'signup') => {
    setAuthMode(mode);
    setCurrentPage('auth');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const handleAuthSuccess = () => {
    console.log('🎉 Authentication successful, transitioning to main app');
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('landing');
    } catch (error) {
      console.error('❌ Logout error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleUpdateProfile = async (updatedData: any) => {
    if (!user?.id) {
      console.error('No user ID available for update');
      Alert.alert('Error', 'No user information available. Please sign in again.');
      return;
    }

    try {
      console.log('🔄 Starting mobile profile update for user:', user.id);
      console.log('🔄 Update data:', updatedData);

      if (updateUserProfile) {
        await updateUserProfile(updatedData);
        console.log('✅ Mobile profile update successful');
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('❌ Mobile profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    }
  };

  // Show global loading state
  if (loading && !user && currentPage !== 'landing') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  // Render appropriate screen based on current page
  const renderCurrentScreen = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingScreen
            onSignUp={() => handleGoToAuth('signup')}
            onSignIn={() => handleGoToAuth('signin')}
          />
        );

      case 'auth':
        return (
          <AuthScreen
            onBack={handleBackToLanding}
            onSuccess={handleAuthSuccess}
            initialMode={authMode}
          />
        );

      case 'home':
        // Only show HomeScreen if user is authenticated
        if (!user || !sessionValid) {
          console.log('⚠️ Tried to show HomeScreen without authenticated user');
          setCurrentPage('landing');
          return null;
        }
        return (
          <HomeScreen />
        );

      case 'profile-setup':
        // TODO: Implement dedicated profile setup screen
        // For now, redirect to home and handle there
        if (user) {
          setCurrentPage('home');
        } else {
          setCurrentPage('landing');
        }
        return null;

      case 'user-type':
        // TODO: Implement dedicated user type selection screen
        // For now, redirect to home and handle there
        if (user) {
          setCurrentPage('home');
        } else {
          setCurrentPage('landing');
        }
        return null;

      default:
        console.log('⚠️ Unknown page:', currentPage);
        setCurrentPage('landing');
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={currentPage === 'auth' ? 'light-content' : 'dark-content'}
        backgroundColor={currentPage === 'auth' ? '#004D40' : '#F2F5F1'}
      />
      {renderCurrentScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});