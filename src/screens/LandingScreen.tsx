// screens/LandingScreen.tsx - Mobile-native landing screen (Type C conversion)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const { width, height } = Dimensions.get('window');

interface LandingScreenProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onSignUp,
  onSignIn,
}) => {
  const features = [
    {
      icon: '🎯',
      title: 'SMART MATCHING',
      description: 'Advanced algorithm finds your perfect roommate based on lifestyle, budget, and preferences.',
    },
    {
      icon: '💬',
      title: 'SECURE CHAT',
      description: 'Built-in messaging system to connect safely with potential roommates before meeting.',
    },
    {
      icon: '📍',
      title: 'LOCAL SEARCH',
      description: 'Find roommates and places in your exact area with precise location matching.',
    },
    {
      icon: '🔒',
      title: 'VERIFIED PROFILES',
      description: 'All users verified for safety and authenticity. Your security is our priority.',
    },
  ];

  const stats = [
    { number: '50K+', label: 'USERS' },
    { number: '12K+', label: 'MATCHES' },
    { number: '4.9★', label: 'RATING' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004D40" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.brandText}>ROOMEO</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground} />

          <View style={styles.heroContent}>
            {/* Main Logo */}
            <View style={styles.heroLogoContainer}>
              <Text style={styles.heroLogoText}>R</Text>
            </View>

            {/* Hero Text */}
            <Text style={styles.heroTitle}>FIND YOUR{'\n'}PERFECT ROOMMATE</Text>
            <View style={styles.heroUnderline} />
            <Text style={styles.heroSubtitle}>
              SWIPE. MATCH. MOVE IN.{'\n'}THE EASIEST WAY TO FIND HOUSING
            </Text>
            <Text style={styles.heroDescription}>
              JOIN THOUSANDS OF PEOPLE FINDING THEIR PERFECT ROOMMATES AND DREAM APARTMENTS ON ROOMEO.
            </Text>

            {/* CTA Buttons */}
            <View style={styles.ctaContainer}>
              <Button
                title="GET STARTED NOW"
                onPress={onSignUp}
                variant="primary"
                size="lg"
                fullWidth
                style={styles.primaryButton}
              />
              <Button
                title="ALREADY HAVE ACCOUNT? SIGN IN"
                onPress={onSignIn}
                variant="ghost"
                size="default"
                fullWidth
                style={styles.secondaryButton}
              />
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresSectionHeader}>
            <Text style={styles.featuresTitle}>WHY ROOMEO{'\n'}DOMINATES</Text>
            <View style={styles.featuresUnderline} />
            <Text style={styles.featuresSubtitle}>
              BUILT FOR THE MODERN ROOMMATE HUNTER
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Card key={index} variant="outlined" style={styles.featureCard}>
                <CardContent style={styles.featureContent}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.howItWorksTitle}>HOW IT WORKS</Text>
          <View style={styles.howItWorksUnderline} />

          <View style={styles.stepsContainer}>
            {[
              { step: '1', title: 'CREATE PROFILE', desc: 'Tell us about yourself and what you\'re looking for' },
              { step: '2', title: 'START SWIPING', desc: 'Browse potential roommates and places in your area' },
              { step: '3', title: 'MATCH & CHAT', desc: 'Connect with matches and start conversations' },
              { step: '4', title: 'MOVE IN', desc: 'Find your perfect living situation and move in!' },
            ].map((item, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{item.title}</Text>
                  <Text style={styles.stepDescription}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Final CTA Section */}
        <View style={styles.finalCtaSection}>
          <Text style={styles.finalCtaTitle}>READY TO FIND YOUR{'\n'}PERFECT MATCH?</Text>
          <Text style={styles.finalCtaSubtitle}>
            Join thousands of successful roommate matches
          </Text>

          <View style={styles.finalCtaButtons}>
            <Button
              title="START MATCHING NOW"
              onPress={onSignUp}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.finalCtaButton}
            />
            <TouchableOpacity style={styles.signInButton} onPress={onSignIn}>
              <Text style={styles.signInButtonText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#004D40',
    borderBottomWidth: 4,
    borderBottomColor: '#004D40',
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
  heroSection: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F2F5F1',
    opacity: 0.1,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroLogoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#44C76F',
    borderWidth: 4,
    borderColor: '#004D40',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: '#004D40',
    elevation: 8,
    marginBottom: 24,
  },
  heroLogoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#004D40',
    transform: [{ rotate: '-3deg' }],
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
    transform: [{ skewX: '-2deg' }],
  },
  heroUnderline: {
    width: 80,
    height: 6,
    backgroundColor: '#44C76F',
    marginBottom: 20,
    transform: [{ skewX: '12deg' }],
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    transform: [{ skewX: '-1deg' }],
  },
  heroDescription: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004D40',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  ctaContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: '#004D40',
    elevation: 8,
  },
  secondaryButton: {
    // Ghost button style
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#44C76F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#004D40',
  },
  featuresSection: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  featuresSectionHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
    transform: [{ skewX: '-3deg' }],
  },
  featuresUnderline: {
    width: 60,
    height: 6,
    backgroundColor: '#004D40',
    marginBottom: 16,
    transform: [{ skewX: '12deg' }],
  },
  featuresSubtitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'rgba(244, 245, 241, 0.95)',
  },
  featureContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004D40',
    textAlign: 'center',
    lineHeight: 20,
  },
  howItWorksSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#F2F5F1',
  },
  howItWorksTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 12,
    transform: [{ skewX: '-2deg' }],
  },
  howItWorksUnderline: {
    width: 60,
    height: 6,
    backgroundColor: '#44C76F',
    alignSelf: 'center',
    marginBottom: 32,
    transform: [{ skewX: '12deg' }],
  },
  stepsContainer: {
    gap: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 48,
    height: 48,
    backgroundColor: '#44C76F',
    borderWidth: 3,
    borderColor: '#004D40',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: '#004D40',
    elevation: 4,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004D40',
    lineHeight: 20,
  },
  finalCtaSection: {
    backgroundColor: '#004D40',
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F2F5F1',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
    transform: [{ skewX: '-2deg' }],
  },
  finalCtaSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#44C76F',
    textAlign: 'center',
    marginBottom: 32,
  },
  finalCtaButtons: {
    width: '100%',
    gap: 16,
  },
  finalCtaButton: {
    backgroundColor: '#44C76F',
    borderColor: '#F2F5F1',
    shadowColor: '#F2F5F1',
  },
  signInButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#44C76F',
    textDecorationLine: 'underline',
  },
  bottomSpacing: {
    height: 40,
  },
});