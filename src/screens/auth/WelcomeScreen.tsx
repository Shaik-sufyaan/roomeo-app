import React from 'react'
import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import { Button } from '../../components/ui/Button'

// Hardcoded constants to avoid import issues
const COLORS = {
  primary: '#004D40',
  secondary: '#44C76F',
  background: '#F2F5F1',
  accent: '#D4AF37',
  white: '#FFFFFF',
}

const SIZES = {
  padding: 16,
  margin: 16,
  borderRadius: 8,
}

interface WelcomeScreenProps {
  navigation?: any // Will be properly typed when React Navigation is added
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleGetStarted = () => {
    // navigation?.navigate('SignUp')
    console.log('Get Started pressed')
  }

  const handleSignIn = () => {
    // navigation?.navigate('SignIn')
    console.log('Sign In pressed')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Roomio Branding */}
        <View style={styles.brandingContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.appName}>ROOMIO</Text>
          <Text style={styles.tagline}>
            Find Your Perfect Roommate Today
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            variant="primary"
            style={styles.button}
          />
          <Button
            title="Sign In"
            onPress={handleSignIn}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 1.5,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: COLORS.secondary,
    borderWidth: 4,
    borderColor: COLORS.primary,
    borderRadius: 16,
    transform: [{ rotate: '3deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '900',
  },
  appName: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
  },
})

export default WelcomeScreen