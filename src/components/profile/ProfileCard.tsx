/**
 * ProfileCard - React Native profile card component optimized for mobile
 */

import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import { Image } from 'expo-image'

const { width } = Dimensions.get('window')

interface ProfileCardProps {
  profilePicture: string
  name: string
  age: number
  profession: string
  location: string
  housingStatus: 'Has a place' | 'Needs a place'
  budget?: string
  preferences: {
    pets: boolean
    smoking: boolean
    drinking: boolean
    vegetarian: boolean
    cleanliness: 'Low' | 'Medium' | 'High'
    noiseLevel: 'Quiet' | 'Moderate' | 'Loud'
    guestPolicy: 'No guests' | 'Occasional guests' | 'Frequent guests'
  }
  hobbies?: string[]
  bio?: string
  onMessage?: () => void
  onViewMore?: () => void
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profilePicture,
  name,
  age,
  profession,
  location,
  housingStatus,
  budget,
  preferences,
  hobbies,
  bio,
  onMessage,
  onViewMore
}) => {
  const preferenceIcons = {
    pets: '🐕',
    smoking: '🚭',
    drinking: '🍺',
    vegetarian: '🥗',
    cleanliness: '🧹',
    noiseLevel: '🔊',
    guestPolicy: '👥'
  }

  const getPreferenceLabel = (key: keyof typeof preferences, value: any) => {
    switch (key) {
      case 'pets':
        return value ? 'Pet Friendly' : 'No Pets'
      case 'smoking':
        return value ? 'Smoking OK' : 'No Smoking'
      case 'drinking':
        return value ? 'Drinking OK' : 'No Drinking'
      case 'vegetarian':
        return value ? 'Vegetarian' : 'Non-Vegetarian'
      case 'cleanliness':
        return `${value} Cleanliness`
      case 'noiseLevel':
        return `${value} Noise`
      case 'guestPolicy':
        return value
      default:
        return ''
    }
  }

  const getPreferenceColor = (key: keyof typeof preferences, value: any) => {
    const colorMap = {
      pets: value ? { bg: '#dcfce7', text: '#166534' } : { bg: '#fee2e2', text: '#991b1b' },
      smoking: value ? { bg: '#fed7aa', text: '#9a3412' } : { bg: '#dcfce7', text: '#166534' },
      drinking: value ? { bg: '#dbeafe', text: '#1e40af' } : { bg: '#f3f4f6', text: '#374151' },
      vegetarian: value ? { bg: '#dcfce7', text: '#166534' } : { bg: '#fef3c7', text: '#92400e' },
      cleanliness: { bg: '#f3e8ff', text: '#7c3aed' },
      noiseLevel: { bg: '#e0e7ff', text: '#3730a3' },
      guestPolicy: { bg: '#fce7f3', text: '#be185d' }
    }
    return colorMap[key] || { bg: '#f3f4f6', text: '#374151' }
  }

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 16
    }}>
      <View style={{
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignSelf: 'center'
      }}>
        <ScrollView
          style={{ maxHeight: width * 1.2 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24 }}
        >
          {/* Profile Picture */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Image
              source={{ uri: profilePicture }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 4,
                borderColor: '#ffffff'
              }}
              contentFit="cover"
            />
          </View>

          {/* Name & Age */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: 4
            }}>
              {name}, {age}
            </Text>
            <Text style={{
              fontSize: 16,
              fontWeight: '500',
              color: '#4b5563',
              marginBottom: 2
            }}>
              {profession}
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6b7280'
            }}>
              {location}
            </Text>
          </View>

          {/* Housing Status */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: housingStatus === 'Has a place' ? '#dcfce7' : '#dbeafe'
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: housingStatus === 'Has a place' ? '#166534' : '#1e40af'
              }}>
                {housingStatus}
              </Text>
            </View>
            {budget && (
              <Text style={{
                fontSize: 14,
                color: '#4b5563',
                marginTop: 8
              }}>
                {budget}
              </Text>
            )}
          </View>

          {/* Preferences */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8
            }}>
              Preferences
            </Text>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8
            }}>
              {Object.entries(preferences).map(([key, value]) => {
                const colors = getPreferenceColor(key as keyof typeof preferences, value)
                return (
                  <View
                    key={key}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 16,
                      backgroundColor: colors.bg
                    }}
                  >
                    <Text style={{ marginRight: 4, fontSize: 12 }}>
                      {preferenceIcons[key as keyof typeof preferenceIcons]}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: colors.text
                    }}>
                      {getPreferenceLabel(key as keyof typeof preferences, value)}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>

          {/* Hobbies */}
          {hobbies && hobbies.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 8
              }}>
                Hobbies
              </Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8
              }}>
                {hobbies.map((hobby, index) => (
                  <View
                    key={index}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: '#f3f4f6'
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      {hobby}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Bio */}
          {bio && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 8
              }}>
                About
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#4b5563',
                lineHeight: 20
              }}>
                {bio}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            paddingTop: 16
          }}>
            <TouchableOpacity
              onPress={onMessage}
              style={{
                flex: 1,
                backgroundColor: '#2563eb',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#ffffff',
                fontWeight: '500',
                fontSize: 16,
                marginRight: 8
              }}>
                Message
              </Text>
              <Text style={{ fontSize: 16 }}>💬</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onViewMore}
              style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#374151',
                fontWeight: '500',
                fontSize: 16,
                marginRight: 8
              }}>
                View More
              </Text>
              <Text style={{ fontSize: 16 }}>🔽</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

export default ProfileCard