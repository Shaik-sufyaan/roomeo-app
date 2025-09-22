/**
 * TypingIndicator - React Native animated typing indicator component
 * Shows when other users are typing with smooth animations
 */

import React, { useEffect, useRef } from 'react'
import { View, Text, Animated } from 'react-native'
import { Image } from 'expo-image'

interface TypingIndicatorProps {
  isVisible: boolean
  typingUsers: string[]
}

export function TypingIndicator({
  isVisible,
  typingUsers
}: TypingIndicatorProps) {
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isVisible && typingUsers.length > 0) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isVisible, typingUsers.length])

  if (!isVisible || typingUsers.length === 0) {
    return null
  }

  /**
   * Format typing users text
   */
  const getTypingText = (): string => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing`
    } else if (typingUsers.length === 3) {
      return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers[2]} are typing`
    } else {
      return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers.length - 2} others are typing`
    }
  }

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
        opacity: fadeAnim,
      }}
    >
      {/* Avatar placeholder */}
      <View
        style={{
          width: 32,
          height: 32,
          backgroundColor: '#d1d5db',
          borderRadius: 16,
          marginRight: 8
        }}
      />

      {/* Typing bubble */}
      <View
        style={{
          backgroundColor: '#f3f4f6',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 16,
          borderBottomLeftRadius: 4,
          paddingHorizontal: 16,
          paddingVertical: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
          marginRight: 8
        }}
      >
        <TypingDots />
      </View>

      {/* Typing text */}
      <Text
        style={{
          fontSize: 12,
          color: '#6b7280',
          fontStyle: 'italic'
        }}
      >
        {getTypingText()}
      </Text>
    </Animated.View>
  )
}

/**
 * Simple typing dots animation component
 */
export function TypingDots({
  size = 'md'
}: {
  size?: 'sm' | 'md' | 'lg'
}) {
  const dot1Anim = useRef(new Animated.Value(0)).current
  const dot2Anim = useRef(new Animated.Value(0)).current
  const dot3Anim = useRef(new Animated.Value(0)).current

  const dotSizes = {
    sm: 4,
    md: 8,
    lg: 12
  }

  const dotSize = dotSizes[size]

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      )
    }

    const animation1 = createAnimation(dot1Anim, 0)
    const animation2 = createAnimation(dot2Anim, 200)
    const animation3 = createAnimation(dot3Anim, 400)

    animation1.start()
    animation2.start()
    animation3.start()

    return () => {
      animation1.stop()
      animation2.stop()
      animation3.stop()
    }
  }, [])

  const createDot = (animValue: Animated.Value) => (
    <Animated.View
      style={{
        width: dotSize,
        height: dotSize,
        backgroundColor: '#9ca3af',
        borderRadius: dotSize / 2,
        marginHorizontal: 2,
        transform: [
          {
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.5],
            }),
          },
        ],
        opacity: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 1],
        }),
      }}
    />
  )

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {createDot(dot1Anim)}
      {createDot(dot2Anim)}
      {createDot(dot3Anim)}
    </View>
  )
}

/**
 * Typing indicator with WhatsApp-like appearance
 */
export function WhatsAppTypingIndicator({
  isVisible
}: {
  isVisible: boolean
}) {
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
        opacity: fadeAnim,
      }}
    >
      <View
        style={{
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 16,
          borderBottomLeftRadius: 4,
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <TypingDots />
      </View>
    </Animated.View>
  )
}

/**
 * Multiple users typing indicator with avatars
 */
export function MultiUserTypingIndicator({
  typingUsers,
  getUserAvatar
}: {
  typingUsers: Array<{ id: string; name: string }>
  getUserAvatar?: (userId: string) => string
}) {
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (typingUsers.length > 0) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Pulse animation for typing indicator
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      )

      pulseAnimation.start()

      return () => {
        pulseAnimation.stop()
      }
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [typingUsers.length])

  if (typingUsers.length === 0) return null

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
        opacity: fadeAnim,
      }}
    >
      {/* Show up to 3 avatars */}
      <View style={{ flexDirection: 'row', marginRight: 8 }}>
        {typingUsers.slice(0, 3).map((user, index) => (
          <View
            key={user.id}
            style={{
              marginLeft: index > 0 ? -8 : 0,
              zIndex: 3 - index
            }}
          >
            <Image
              source={{
                uri: getUserAvatar?.(user.id) || 'https://via.placeholder.com/24x24/cccccc/666666?text=U'
              }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: '#ffffff'
              }}
              contentFit="cover"
            />
            {/* Typing animation pulse */}
            <Animated.View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 12,
                height: 12,
                backgroundColor: '#22c55e',
                borderRadius: 6,
                borderWidth: 2,
                borderColor: '#ffffff',
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3],
                    }),
                  },
                ],
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.5],
                }),
              }}
            />
          </View>
        ))}
        {typingUsers.length > 3 && (
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: '#e5e7eb',
              borderRadius: 12,
              borderWidth: 2,
              borderColor: '#ffffff',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: -8
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#6b7280' }}>
              +{typingUsers.length - 3}
            </Text>
          </View>
        )}
      </View>

      {/* Typing bubble with dots */}
      <View
        style={{
          backgroundColor: '#f3f4f6',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 16,
          borderBottomLeftRadius: 4,
          paddingHorizontal: 12,
          paddingVertical: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
          marginRight: 8
        }}
      >
        <TypingDots size="sm" />
      </View>

      {/* Typing text */}
      <Text
        style={{
          fontSize: 12,
          color: '#6b7280',
          fontStyle: 'italic'
        }}
      >
        {typingUsers.length === 1
          ? `${typingUsers[0].name} is typing...`
          : `${typingUsers.length} people are typing...`
        }
      </Text>
    </Animated.View>
  )
}

export default TypingIndicator