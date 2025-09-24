/**
 * LockedSwipeScreen - React Native locked swipe screen for quick_access users
 * Shows upgrade prompt to unlock roommate matching features
 */

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface LockedSwipeScreenProps {
  onUpgrade: () => void
  userType: string
  lockReason?: 'upgrade_required' | 'other'
}

export default function LockedSwipeScreen({
  onUpgrade,
  userType,
  lockReason = 'upgrade_required'
}: LockedSwipeScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F5F1' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />

      {/* Header */}
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 24,
        alignItems: 'center',
        backgroundColor: '#F2F5F1',
        borderBottomWidth: 4,
        borderBottomColor: '#004D40'
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: '900',
          color: '#004D40',
          marginBottom: 8,
          textAlign: 'center',
          transform: [{ skewX: '-2deg' }]
        }}>
          DISCOVER ROOMMATES
        </Text>
        <View style={{
          width: 120,
          height: 12,
          backgroundColor: '#44C76F',
          transform: [{ skewX: '12deg' }]
        }} />
      </View>

      {/* Main content area */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingVertical: 20
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{
          backgroundColor: '#B7C8B5',
          borderWidth: 4,
          borderColor: '#004D40',
          borderRadius: 16,
          shadowColor: '#004D40',
          shadowOffset: { width: 8, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 8,
          padding: 32,
          maxWidth: 400,
          alignSelf: 'center',
          width: '100%'
        }}>
          {/* Lock icon */}
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: '#44C76F',
            borderWidth: 4,
            borderColor: '#004D40',
            borderRadius: 40,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginBottom: 24,
            transform: [{ rotate: '3deg' }],
            shadowColor: '#004D40',
            shadowOffset: { width: 6, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 6
          }}>
            <Ionicons
              name="lock-closed"
              size={40}
              color="#004D40"
              style={{ transform: [{ rotate: '-3deg' }] }}
            />
          </View>

          <Text style={{
            fontSize: 22,
            fontWeight: '900',
            color: '#004D40',
            marginBottom: 16,
            textAlign: 'center',
            transform: [{ skewX: '-1deg' }]
          }}>
            🔒 ROOMMATE MATCHING LOCKED
          </Text>

          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#004D40',
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 22
          }}>
            {lockReason === 'upgrade_required' && userType === 'quick_access'
              ? "Quick Access users can't see roommate profiles. Upgrade to unlock swiping and matching features!"
              : "This feature is currently locked. Upgrade to access roommate matching."
            }
          </Text>

          {/* Features you'll unlock */}
          <View style={{
            backgroundColor: '#F2F5F1',
            borderWidth: 2,
            borderColor: '#004D40',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '900',
              color: '#004D40',
              marginBottom: 12,
              textAlign: 'center'
            }}>
              🚀 UNLOCK THESE FEATURES:
            </Text>

            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#44C76F', fontSize: 16, fontWeight: '900' }}>✓</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#004D40', flex: 1 }}>
                  Swipe through potential roommates
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#44C76F', fontSize: 16, fontWeight: '900' }}>✓</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#004D40', flex: 1 }}>
                  Match with compatible people
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#44C76F', fontSize: 16, fontWeight: '900' }}>✓</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#004D40', flex: 1 }}>
                  View detailed profiles & photos
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#44C76F', fontSize: 16, fontWeight: '900' }}>✓</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#004D40', flex: 1 }}>
                  Access the matches page
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={onUpgrade}
            style={{
              backgroundColor: '#44C76F',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderWidth: 4,
              borderColor: '#004D40',
              borderRadius: 8,
              shadowColor: '#004D40',
              shadowOffset: { width: 6, height: 6 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 6,
              marginBottom: 16
            }}
            activeOpacity={0.8}
          >
            <Text style={{
              fontSize: 18,
              fontWeight: '900',
              color: '#004D40',
              textAlign: 'center'
            }}>
              🔓 UNLOCK FULL FEATURES
            </Text>
          </TouchableOpacity>

          <Text style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: '#004D40',
            opacity: 0.8,
            textAlign: 'center'
          }}>
            Keep all your marketplace listings, expenses, and chat history!
          </Text>
        </View>
      </ScrollView>

      {/* Bottom area */}
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 24,
        alignItems: 'center'
      }}>
        <Text style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: '#004D40',
          opacity: 0.6,
          textAlign: 'center'
        }}>
          You can still use marketplace, expenses, and chat features
        </Text>
      </View>
    </SafeAreaView>
  )
}