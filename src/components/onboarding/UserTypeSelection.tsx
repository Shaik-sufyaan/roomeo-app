/**
 * UserTypeSelection - React Native user type selection component
 * Allows users to choose their housing situation
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { updateUserProfile } from '../../services/supabase'

interface UserTypeSelectionProps {
  onComplete: () => void
}

export default function UserTypeSelection({ onComplete }: UserTypeSelectionProps) {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState<"provider" | "seeker" | "quick_access" | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!user || !selectedType) {
      Alert.alert('Error', 'Please select your housing situation')
      return
    }

    setLoading(true)

    try {
      console.log("🔄 Updating user profile with userType:", selectedType)

      // Save userType to Supabase
      const success = await updateUserProfile(user.id, {
        userType: selectedType,
        updatedAt: new Date(),
      })

      if (!success) {
        throw new Error("Failed to update user profile")
      }

      console.log("✅ User type saved successfully")
      console.log("✅ Calling onComplete to navigate to main app")
      onComplete()

    } catch (error) {
      console.error("❌ Failed to save user type:", error)
      Alert.alert('Error', 'Failed to save your selection. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state if user is not available yet
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F5F1' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 16
        }}>
          <View style={{
            width: 64,
            height: 64,
            backgroundColor: '#44C76F',
            borderWidth: 4,
            borderColor: '#004D40',
            transform: [{ rotate: '3deg' }],
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
            shadowColor: '#004D40',
            shadowOffset: { width: 6, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 6
          }}>
            <Text style={{
              color: '#004D40',
              fontWeight: '900',
              fontSize: 24,
              transform: [{ rotate: '-3deg' }]
            }}>
              R
            </Text>
          </View>
          <ActivityIndicator size="large" color="#004D40" />
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#004D40',
            marginTop: 16
          }}>
            Loading your profile...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const userTypeOptions = [
    {
      id: 'provider',
      title: 'I HAVE A PLACE',
      description: "I own or rent a place and I'm looking for a roommate to share it with",
      icon: 'home',
      infoText: '🏠 You\'ll see people looking for places to share'
    },
    {
      id: 'seeker',
      title: "I'M LOOKING FOR A PLACE",
      description: 'I need to find a room or place to share with someone who already has one',
      icon: 'search',
      infoText: '🔍 You\'ll see people who have places available'
    },
    {
      id: 'quick_access',
      title: 'QUICK ACCESS',
      description: 'I just want to use marketplace, expenses & chat features',
      icon: 'flash',
      infoText: '⚡ You\'ll get marketplace, expenses & chat access only'
    }
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F5F1' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingVertical: 32
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
          padding: 32
        }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 64,
              height: 64,
              backgroundColor: '#44C76F',
              borderWidth: 4,
              borderColor: '#004D40',
              transform: [{ rotate: '3deg' }],
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              shadowColor: '#004D40',
              shadowOffset: { width: 6, height: 6 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 6
            }}>
              <Text style={{
                color: '#004D40',
                fontWeight: '900',
                fontSize: 24,
                transform: [{ rotate: '-3deg' }]
              }}>
                R
              </Text>
            </View>

            <Text style={{
              fontSize: 32,
              fontWeight: '900',
              color: '#004D40',
              marginBottom: 8,
              textAlign: 'center',
              transform: [{ skewX: '-2deg' }]
            }}>
              HEY {user.name?.toUpperCase() || "THERE"}!
            </Text>

            <View style={{
              width: 128,
              height: 12,
              backgroundColor: '#44C76F',
              transform: [{ skewX: '12deg' }],
              marginBottom: 16
            }} />

            <Text style={{
              fontSize: 24,
              fontWeight: '900',
              color: '#004D40',
              marginBottom: 16,
              textAlign: 'center',
              transform: [{ skewX: '-1deg' }]
            }}>
              WHAT'S YOUR SITUATION?
            </Text>

            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#004D40',
              textAlign: 'center'
            }}>
              Choose your housing situation to find the right matches
            </Text>
          </View>

          {/* User Type Options */}
          <View style={{ marginBottom: 32 }}>
            {userTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => !loading && setSelectedType(option.id as any)}
                disabled={loading}
                style={{
                  padding: 24,
                  borderWidth: 4,
                  borderColor: '#004D40',
                  borderRadius: 8,
                  marginBottom: 16,
                  backgroundColor: selectedType === option.id ? '#44C76F' : '#F2F5F1',
                  shadowColor: '#004D40',
                  shadowOffset: selectedType === option.id ? { width: 8, height: 8 } : { width: 6, height: 6 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: selectedType === option.id ? 8 : 6,
                  opacity: loading ? 0.5 : 1
                }}
                activeOpacity={0.8}
              >
                <View style={{ alignItems: 'center' }}>
                  <View style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 16,
                    borderWidth: 4,
                    borderColor: '#004D40',
                    backgroundColor: selectedType === option.id ? '#F2F5F1' : '#44C76F',
                    shadowColor: '#004D40',
                    shadowOffset: { width: 4, height: 4 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 4
                  }}>
                    <Ionicons
                      name={option.icon as any}
                      size={32}
                      color={selectedType === option.id ? '#44C76F' : '#004D40'}
                    />
                  </View>

                  <Text style={{
                    fontSize: 20,
                    fontWeight: '900',
                    color: '#004D40',
                    marginBottom: 12,
                    textAlign: 'center',
                    transform: [{ skewX: '-1deg' }]
                  }}>
                    {option.title}
                  </Text>

                  <Text style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#004D40',
                    textAlign: 'center',
                    lineHeight: 18
                  }}>
                    {option.description}
                  </Text>

                  {selectedType === option.id && (
                    <View style={{
                      marginTop: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: '#F2F5F1',
                      borderWidth: 2,
                      borderColor: '#004D40',
                      borderRadius: 4
                    }}>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '900',
                        color: '#004D40',
                        textAlign: 'center'
                      }}>
                        ✓ SELECTED
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!selectedType || loading}
            style={{
              backgroundColor: '#004D40',
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
              opacity: (!selectedType || loading) ? 0.5 : 1,
              marginBottom: 16
            }}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8
              }}>
                <ActivityIndicator size="small" color="#F2F5F1" />
                <Text style={{
                  color: '#F2F5F1',
                  fontWeight: '900',
                  fontSize: 20,
                  textAlign: 'center'
                }}>
                  SETTING UP...
                </Text>
              </View>
            ) : (
              <Text style={{
                color: '#F2F5F1',
                fontWeight: '900',
                fontSize: 20,
                textAlign: 'center'
              }}>
                {selectedType === "quick_access" ? "CONTINUE TO QUICK ACCESS" : "CONTINUE TO MATCHING"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Info Text */}
          {selectedType && (
            <View style={{
              backgroundColor: '#F2F5F1',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 2,
              borderColor: '#004D40',
              borderRadius: 4,
              shadowColor: '#004D40',
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#004D40',
                textAlign: 'center'
              }}>
                {userTypeOptions.find(option => option.id === selectedType)?.infoText}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}