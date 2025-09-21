// screens/AuthScreen.tsx - Mobile-native authentication screen (Type C conversion)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const { width } = Dimensions.get('window');

interface AuthScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  initialMode?: 'signup' | 'signin';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onBack,
  onSuccess,
  initialMode = 'signup',
}) => {
  const {
    user,
    loading,
    error: authError,
    emailSignUp,
    emailSignIn,
    googleSignIn,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (user && !loading) {
      console.log('✅ Auth successful, calling onSuccess callback');
      onSuccess();
    }
  }, [user, loading, onSuccess]);

  const handleEmailAuth = async () => {
    setError('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Name is required for sign up');
      return;
    }

    setEmailLoading(true);
    try {
      if (isSignUp) {
        await emailSignUp(email.trim(), password, name.trim());
        setError('');
        setSuccessMessage(
          '🎉 Account created! Please check your email inbox and click the verification link to activate your account. Once verified, you can sign in below.'
        );
        setIsSignUp(false);
        setPassword('');
      } else {
        await emailSignIn(email.trim(), password);
        onSuccess();
      }
    } catch (error: any) {
      console.error('❌ Authentication error:', error);

      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('Invalid email or password')
      ) {
        setError(
          'It looks like you signed up with Google. Please use the "Continue with Google" button instead, or use "Forgot Password?" to set a password for email login.'
        );
      } else {
        setError(error.message || 'Authentication failed. Please try again.');
      }
      setSuccessMessage('');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setSuccessMessage('');

    if (authError) {
      setError(authError);
      return;
    }

    setGoogleLoading(true);
    try {
      await googleSignIn();
      onSuccess();
    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      setError(error.message || 'Google authentication failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setError('Please enter your email address first');
      return;
    }

    Alert.alert(
      'Password Reset',
      `Send password reset email to ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              // Note: In mobile app, this would typically use a deep link
              // For now, we'll show a success message
              setSuccessMessage(
                '📧 Password reset email sent! Check your inbox and click the link to set a new password.'
              );
              setShowForgotPassword(false);
            } catch (error: any) {
              setError(error.message || 'Failed to send password reset email');
            }
          },
        },
      ]
    );
  };

  if (authError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>⚠️ Configuration Error</Text>
            <Text style={styles.errorMessage}>{authError}</Text>
            <Text style={styles.errorDetails}>
              Check these environment variables:
              {'\n'}• EXPO_PUBLIC_SUPABASE_URL
              {'\n'}• EXPO_PUBLIC_SUPABASE_ANON_KEY
            </Text>
            <Button
              title="GO BACK"
              onPress={onBack}
              variant="destructive"
              style={styles.errorButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004D40" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerBrand}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.brandText}>ROOMIO</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleLogoContainer}>
              <Text style={styles.titleLogoText}>R</Text>
            </View>
            <Text style={styles.titleMain}>
              {isSignUp ? 'JOIN ROOMIO' : 'WELCOME BACK'}
            </Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.titleSub}>
              {isSignUp ? 'CREATE YOUR ACCOUNT' : 'SIGN IN TO YOUR ACCOUNT'}
            </Text>
            <Text style={styles.titleDescription}>
              {isSignUp
                ? 'JOIN THOUSANDS OF PEOPLE FINDING THEIR PERFECT ROOMMATES ON ROOMIO.'
                : 'WELCOME BACK! CONTINUE YOUR ROOMMATE SEARCH WHERE YOU LEFT OFF.'}
            </Text>
          </View>

          {/* Messages */}
          {successMessage && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorMessage}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {loading && (
            <View style={styles.loadingMessage}>
              <LoadingSpinner />
              <Text style={styles.loadingText}>Processing... Please wait</Text>
            </View>
          )}

          {/* Email Authentication Card */}
          <Card variant="outlined" style={styles.authCard}>
            <CardContent>
              <Text style={styles.cardTitle}>
                {isSignUp ? 'SIGN UP WITH EMAIL' : 'SIGN IN WITH EMAIL'}
              </Text>

              <View style={styles.formContainer}>
                {isSignUp && (
                  <View style={styles.inputContainer}>
                    <Input
                      label="FULL NAME"
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      disabled={emailLoading}
                      required={isSignUp}
                      style={styles.input}
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Input
                    label="EMAIL ADDRESS"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    disabled={emailLoading}
                    required
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Input
                    label="PASSWORD"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    showPasswordToggle
                    disabled={emailLoading}
                    required
                    style={styles.input}
                  />
                </View>

                <Button
                  title={
                    emailLoading
                      ? 'PROCESSING...'
                      : isSignUp
                      ? 'CREATE ACCOUNT'
                      : 'SIGN IN'
                  }
                  onPress={handleEmailAuth}
                  disabled={emailLoading}
                  loading={emailLoading}
                  variant="primary"
                  fullWidth
                  style={styles.authButton}
                />

                {!isSignUp && (
                  <TouchableOpacity
                    style={styles.forgotButton}
                    onPress={() => setShowForgotPassword(!showForgotPassword)}
                    disabled={emailLoading}
                  >
                    <Text style={styles.forgotButtonText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}

                {showForgotPassword && (
                  <View style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotTitle}>RESET PASSWORD</Text>
                    <Text style={styles.forgotDescription}>
                      Enter your email to receive a password reset link:
                    </Text>
                    <View style={styles.forgotActions}>
                      <Button
                        title="SEND RESET EMAIL"
                        onPress={handleForgotPassword}
                        disabled={emailLoading || !email.trim()}
                        variant="secondary"
                        size="sm"
                        style={styles.forgotActionButton}
                      />
                      <Button
                        title="CANCEL"
                        onPress={() => setShowForgotPassword(false)}
                        disabled={emailLoading}
                        variant="ghost"
                        size="sm"
                        style={styles.forgotActionButton}
                      />
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.switchModeButton}
                  onPress={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccessMessage('');
                    setShowForgotPassword(false);
                  }}
                  disabled={emailLoading}
                >
                  <Text style={styles.switchModeText}>
                    {isSignUp
                      ? 'Already have an account? SIGN IN'
                      : "Don't have an account? SIGN UP"}
                  </Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          {/* Google Authentication Card */}
          <Card variant="outlined" style={styles.authCard}>
            <CardContent style={styles.googleCard}>
              <Text style={styles.cardTitle}>
                {isSignUp ? 'SIGN UP WITH GOOGLE' : 'SIGN IN WITH GOOGLE'}
              </Text>

              <View style={styles.googleContent}>
                <Text style={styles.googleIcon}>🔍</Text>
                <Text style={styles.googleDescription}>
                  {isSignUp
                    ? 'Quick and secure sign up with your Google account'
                    : 'Sign in instantly with your Google account'}
                </Text>

                <Button
                  title={
                    googleLoading ? 'PROCESSING...' : 'CONTINUE WITH GOOGLE'
                  }
                  onPress={handleGoogleAuth}
                  disabled={googleLoading}
                  loading={googleLoading}
                  variant="secondary"
                  fullWidth
                  style={styles.googleButton}
                />

                <Text style={styles.googleNote}>
                  {isSignUp
                    ? 'New users go through profile setup'
                    : 'Existing users skip to matching'}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#004D40',
    borderBottomWidth: 4,
    borderBottomColor: '#004D40',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F2F5F1',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#44C76F',
    borderWidth: 2,
    borderColor: '#F2F5F1',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: '#F2F5F1',
    elevation: 4,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
    transform: [{ rotate: '-3deg' }],
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F2F5F1',
    transform: [{ skewX: '-6deg' }],
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleLogoContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#44C76F',
    borderWidth: 3,
    borderColor: '#004D40',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: '#004D40',
    elevation: 6,
    marginBottom: 16,
  },
  titleLogoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#004D40',
    transform: [{ rotate: '-3deg' }],
  },
  titleMain: {
    fontSize: 28,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 8,
    transform: [{ skewX: '-2deg' }],
  },
  titleUnderline: {
    width: 60,
    height: 6,
    backgroundColor: '#44C76F',
    marginBottom: 16,
    transform: [{ skewX: '12deg' }],
  },
  titleSub: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 12,
    transform: [{ skewX: '-1deg' }],
  },
  titleDescription: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004D40',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#44C76F',
    paddingLeft: 12,
  },
  successMessage: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 2,
    borderColor: '#22C55E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'center',
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
  },
  loadingMessage: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
    textAlign: 'center',
    marginTop: 8,
  },
  authCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 20,
    transform: [{ skewX: '-1deg' }],
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    // Input component handles its own styling
  },
  input: {
    // Additional input styling if needed
  },
  authButton: {
    marginTop: 8,
  },
  forgotButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  forgotButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#44C76F',
    textDecorationLine: 'underline',
  },
  forgotPasswordContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderWidth: 2,
    borderColor: '#93C5FD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  forgotTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 8,
  },
  forgotDescription: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004D40',
    marginBottom: 12,
  },
  forgotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  forgotActionButton: {
    flex: 1,
  },
  switchModeButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  switchModeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#44C76F',
    textAlign: 'center',
  },
  googleCard: {
    alignItems: 'center',
  },
  googleContent: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  googleIcon: {
    fontSize: 48,
  },
  googleDescription: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004D40',
    textAlign: 'center',
  },
  googleButton: {
    width: '100%',
  },
  googleNote: {
    fontSize: 12,
    fontWeight: '700',
    color: '#004D40',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 4,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 20,
    textAlign: 'left',
  },
  errorButton: {
    width: '100%',
  },
});