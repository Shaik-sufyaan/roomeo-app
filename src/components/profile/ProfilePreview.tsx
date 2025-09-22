/**
 * ProfilePreview - React Native profile preview component
 * Shows how the user's profile appears to others
 */

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { normalizeAvatarUrl, getFallbackAvatarUrl } from '../../utils'

const { width, height } = Dimensions.get('window')

interface User {
  id: string
  email: string
  name: string
  profilePicture: string
  age?: number
  bio?: string
  location?: string
  preferences?: {
    smoking: boolean
    drinking: boolean
    vegetarian: boolean
    pets: boolean
  }
  userType?: "seeker" | "provider" | null
}

interface ProfilePreviewProps {
  user: User
  onBack: () => void
}

export default function ProfilePreview({ user, onBack }: ProfilePreviewProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#004D40' }}>
      <StatusBar barStyle="light-content" backgroundColor="#004D40" />

      <View style={{ flex: 1, backgroundColor: '#F2F5F1' }}>
        {/* Header */}
        <View style={{
          backgroundColor: '#004D40',
          borderBottomWidth: 4,
          borderBottomColor: '#44C76F',
          paddingHorizontal: 16,
          paddingVertical: 12
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16
          }}>
            <TouchableOpacity
              onPress={onBack}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#F2F5F1',
                borderRadius: 8,
                padding: 8,
                shadowColor: '#F2F5F1',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 4
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#F2F5F1" />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                width: 32,
                height: 32,
                backgroundColor: '#44C76F',
                borderWidth: 2,
                borderColor: '#F2F5F1',
                borderRadius: 4,
                transform: [{ rotate: '3deg' }],
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#F2F5F1',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2
              }}>
                <Text style={{
                  color: '#004D40',
                  fontWeight: '900',
                  fontSize: 14,
                  transform: [{ rotate: '-3deg' }]
                }}>
                  R
                </Text>
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: '900',
                color: '#F2F5F1',
                transform: [{ skewX: '-3deg' }]
              }}>
                PROFILE PREVIEW
              </Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
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
            width: '100%',
            maxWidth: 400,
            alignSelf: 'center'
          }}>
            {/* Title */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '900',
                color: '#004D40',
                textAlign: 'center',
                transform: [{ skewX: '-1deg' }]
              }}>
                HOW OTHERS SEE YOUR PROFILE
              </Text>
              <View style={{
                width: 60,
                height: 8,
                backgroundColor: '#44C76F',
                marginTop: 8,
                transform: [{ skewX: '12deg' }]
              }} />
            </View>

            {/* Profile Card */}
            <View style={{
              backgroundColor: '#B7C8B5',
              borderRadius: 16,
              borderWidth: 4,
              borderColor: '#004D40',
              shadowColor: '#004D40',
              shadowOffset: { width: 8, height: 8 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 8,
              overflow: 'hidden',
              marginBottom: 24
            }}>
              {/* Profile Image with Overlay */}
              <View style={{ position: 'relative' }}>
                <Image
                  source={{
                    uri: normalizeAvatarUrl(user.profilePicture) || getFallbackAvatarUrl()
                  }}
                  style={{
                    width: '100%',
                    height: 320
                  }}
                  contentFit="cover"
                  onError={() => {
                    console.log("🖼️ Profile preview avatar failed to load, falling back:", user.profilePicture)
                  }}
                />

                {/* Gradient Overlay */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingHorizontal: 16,
                    paddingBottom: 16,
                    paddingTop: 32
                  }}
                >
                  <Text style={{
                    fontSize: 24,
                    fontWeight: '900',
                    color: '#ffffff',
                    transform: [{ skewX: '-1deg' }]
                  }}>
                    {user.name}, {user.age}
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginTop: 4
                  }}>
                    {user.userType === "provider" ? "HAS A PLACE" : "LOOKING FOR A PLACE"}
                  </Text>
                  {user.location && (
                    <Text style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: '#ffffff',
                      opacity: 0.9,
                      marginTop: 4
                    }}>
                      📍 {user.location}
                    </Text>
                  )}
                </LinearGradient>
              </View>

              {/* Preferences and Bio */}
              <View style={{ padding: 16 }}>
                {/* Preferences */}
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 12
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons
                      name={user.preferences?.smoking ? "close-circle" : "checkmark-circle"}
                      size={16}
                      color={user.preferences?.smoking ? "#ef4444" : "#44C76F"}
                    />
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '900',
                      color: '#004D40'
                    }}>
                      {user.preferences?.smoking ? "SMOKER" : "NON-SMOKER"}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons
                      name="heart"
                      size={16}
                      color="#44C76F"
                    />
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '900',
                      color: '#004D40'
                    }}>
                      {user.preferences?.pets ? "PET-FRIENDLY" : "NO PETS"}
                    </Text>
                  </View>

                  {user.preferences?.vegetarian && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 16, color: '#44C76F' }}>🌱</Text>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '900',
                        color: '#004D40'
                      }}>
                        VEGETARIAN
                      </Text>
                    </View>
                  )}

                  {user.preferences?.drinking && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 16, color: '#44C76F' }}>🍺</Text>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '900',
                        color: '#004D40'
                      }}>
                        DRINKS
                      </Text>
                    </View>
                  )}
                </View>

                {/* Bio */}
                {user.bio && (
                  <View style={{
                    borderLeftWidth: 4,
                    borderLeftColor: '#44C76F',
                    paddingLeft: 12
                  }}>
                    <Text style={{
                      color: '#004D40',
                      fontWeight: 'bold',
                      fontSize: 14,
                      lineHeight: 20
                    }}>
                      {user.bio}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Back Button */}
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                onPress={onBack}
                style={{
                  backgroundColor: '#44C76F',
                  borderWidth: 4,
                  borderColor: '#004D40',
                  borderRadius: 8,
                  paddingHorizontal: 32,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#004D40',
                  shadowOffset: { width: 6, height: 6 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 6
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={20} color="#004D40" style={{ marginRight: 8 }} />
                <Text style={{
                  color: '#004D40',
                  fontWeight: '900',
                  fontSize: 16
                }}>
                  BACK TO SETTINGS
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}