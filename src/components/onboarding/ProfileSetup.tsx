/**
 * ProfileSetup - React Native profile setup component
 * Multi-step onboarding flow for user profile creation
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Switch
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { updateUserProfile } from '../../services/supabase'
import { uploadImage } from '../../utils'
import { getAvailableAvatars, normalizeAvatarUrl } from '../../utils'
import { pickImage } from '../../utils'

interface ProfileSetupProps {
  onComplete: () => void
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user, refreshUser } = useAuth()
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<"seeker" | "provider" | "quick_access" | null>(null)
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<string>("")

  // Form data
  const [age, setAge] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [budget, setBudget] = useState("")
  const [universityAffiliation, setUniversityAffiliation] = useState("")
  const [professionalStatus, setProfessionalStatus] = useState<"student" | "employed" | "unemployed" | "">("")
  const [preferences, setPreferences] = useState({
    smoking: false,
    drinking: false,
    vegetarian: false,
    pets: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const avatars = getAvailableAvatars()

  // Initialize userType from user data if already set
  useEffect(() => {
    if (user?.userType) {
      setUserType(user.userType)
      if (step === 1) {
        setStep(2)
      }
    }
  }, [user?.userType, step])

  const handleImagePicker = async () => {
    try {
      const result = await pickImage({
        allowsEditing: true,
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500
      })

      if (result && !result.cancelled && result.uri) {
        setProfileImageUri(result.uri)
        setSelectedAvatar("")
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to select image')
    }
  }

  const handleAvatarSelect = (avatarPath: string) => {
    setSelectedAvatar(avatarPath)
    setProfileImageUri(null)
  }

  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSubmit = async () => {
    if (!user || !userType) return

    setLoading(true)
    setError(null)

    try {
      let photoUrl = ""

      // Use selected avatar if available, otherwise upload custom image
      if (selectedAvatar) {
        photoUrl = selectedAvatar
        console.log("✅ Using selected avatar:", photoUrl)
      } else if (profileImageUri) {
        console.log("🔄 Starting image upload...")
        const uploadResult = await uploadImage(profileImageUri, user.id)

        if (uploadResult.success && uploadResult.url) {
          photoUrl = uploadResult.url
          console.log("✅ Image upload successful:", photoUrl)
        } else {
          console.error("❌ Upload failed:", uploadResult.error)
          Alert.alert('Warning', 'Image upload failed, continuing without profile picture')
        }
      }

      const profileData = {
        age: Number(age) || 0,
        bio,
        location,
        budget: budget ? Number(budget) : 0,
        universityaffiliation: universityAffiliation,
        professionalstatus: professionalStatus,
        preferences,
        profilepicture: photoUrl,
        usertype: userType,
        name: user.name || "",
        email: user.email || "",
      }

      console.log("🔄 Saving profile data...")
      const success = await updateUserProfile(user.id, profileData)

      if (!success) {
        throw new Error("Failed to update profile")
      }

      console.log("✅ Profile setup completed successfully")

      // Refresh user data
      await refreshUser?.()
      onComplete()

    } catch (error) {
      console.error("❌ Profile setup failed:", error)
      setError("Failed to save profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const renderStepIndicator = () => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 24,
      gap: 8
    }}>
      {[1, 2, 3, 4].map((stepNum) => (
        <View
          key={stepNum}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: step >= stepNum ? '#44C76F' : '#d1d5db',
            borderWidth: 2,
            borderColor: '#004D40'
          }}
        />
      ))}
    </View>
  )

  const renderStep1 = () => (
    <View style={{ flex: 1 }}>
      <Text style={{
        fontSize: 24,
        fontWeight: '900',
        color: '#004D40',
        textAlign: 'center',
        marginBottom: 16,
        transform: [{ skewX: '-1deg' }]
      }}>
        BASIC INFO
      </Text>

      {/* Profile Picture Selection */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <TouchableOpacity
          onPress={handleImagePicker}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 4,
            borderColor: '#004D40',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            marginBottom: 16
          }}
        >
          {(profileImageUri || selectedAvatar) ? (
            <Image
              source={{ uri: profileImageUri || selectedAvatar }}
              style={{ width: 112, height: 112, borderRadius: 56 }}
              contentFit="cover"
            />
          ) : (
            <Ionicons name="camera" size={40} color="#6b7280" />
          )}
        </TouchableOpacity>

        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#004D40',
          marginBottom: 16
        }}>
          Choose Avatar or Upload Photo
        </Text>

        {/* Avatar Grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 80 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {avatars.slice(0, 6).map((avatar, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleAvatarSelect(avatar)}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                borderWidth: selectedAvatar === avatar ? 4 : 2,
                borderColor: selectedAvatar === avatar ? '#44C76F' : '#004D40',
                marginRight: 12,
                overflow: 'hidden'
              }}
            >
              <Image
                source={{ uri: avatar }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Age Input */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#004D40',
          marginBottom: 8
        }}>
          Age *
        </Text>
        <TextInput
          value={age}
          onChangeText={setAge}
          placeholder="Enter your age"
          keyboardType="numeric"
          style={{
            borderWidth: 2,
            borderColor: '#004D40',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            backgroundColor: '#ffffff'
          }}
        />
      </View>

      {/* Location Input */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#004D40',
          marginBottom: 8
        }}>
          Location *
        </Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="City, State"
          style={{
            borderWidth: 2,
            borderColor: '#004D40',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            backgroundColor: '#ffffff'
          }}
        />
      </View>
    </View>
  )

  const renderStep2 = () => (
    <View style={{ flex: 1 }}>
      <Text style={{
        fontSize: 24,
        fontWeight: '900',
        color: '#004D40',
        textAlign: 'center',
        marginBottom: 24,
        transform: [{ skewX: '-1deg' }]
      }}>
        ABOUT YOU
      </Text>

      {/* Bio */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#004D40',
          marginBottom: 8
        }}>
          Bio
        </Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={4}
          style={{
            borderWidth: 2,
            borderColor: '#004D40',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            backgroundColor: '#ffffff',
            height: 100,
            textAlignVertical: 'top'
          }}
        />
      </View>

      {/* Professional Status */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#004D40',
          marginBottom: 8
        }}>
          Professional Status
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['student', 'employed', 'unemployed'].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setProfessionalStatus(status as any)}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderWidth: 2,
                borderColor: '#004D40',
                borderRadius: 8,
                backgroundColor: professionalStatus === status ? '#44C76F' : '#ffffff'
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#004D40',
                textAlign: 'center',
                textTransform: 'capitalize'
              }}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* University */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#004D40',
          marginBottom: 8
        }}>
          University/School (if applicable)
        </Text>
        <TextInput
          value={universityAffiliation}
          onChangeText={setUniversityAffiliation}
          placeholder="Enter your university"
          style={{
            borderWidth: 2,
            borderColor: '#004D40',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            backgroundColor: '#ffffff'
          }}
        />
      </View>

      {/* Budget */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#004D40',
          marginBottom: 8
        }}>
          Monthly Budget ($)
        </Text>
        <TextInput
          value={budget}
          onChangeText={setBudget}
          placeholder="Enter your budget"
          keyboardType="numeric"
          style={{
            borderWidth: 2,
            borderColor: '#004D40',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            backgroundColor: '#ffffff'
          }}
        />
      </View>
    </View>
  )

  const renderStep3 = () => (
    <View style={{ flex: 1 }}>
      <Text style={{
        fontSize: 24,
        fontWeight: '900',
        color: '#004D40',
        textAlign: 'center',
        marginBottom: 24,
        transform: [{ skewX: '-1deg' }]
      }}>
        PREFERENCES
      </Text>

      {Object.entries(preferences).map(([key, value]) => (
        <View
          key={key}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 20,
            backgroundColor: '#ffffff',
            borderWidth: 2,
            borderColor: '#004D40',
            borderRadius: 8,
            marginBottom: 12
          }}
        >
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#004D40',
            textTransform: 'capitalize'
          }}>
            {key === 'pets' ? 'Pet Friendly' : key}
          </Text>
          <Switch
            value={value}
            onValueChange={() => handlePreferenceToggle(key as keyof typeof preferences)}
            trackColor={{ false: '#d1d5db', true: '#44C76F' }}
            thumbColor={value ? '#004D40' : '#6b7280'}
          />
        </View>
      ))}
    </View>
  )

  const renderStep4 = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{
        fontSize: 24,
        fontWeight: '900',
        color: '#004D40',
        textAlign: 'center',
        marginBottom: 24,
        transform: [{ skewX: '-1deg' }]
      }}>
        READY TO GO!
      </Text>

      <View style={{
        width: 80,
        height: 80,
        backgroundColor: '#44C76F',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#004D40',
        marginBottom: 24
      }}>
        <Ionicons name="checkmark" size={40} color="#004D40" />
      </View>

      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: '#004D40',
        textAlign: 'center',
        marginBottom: 32
      }}>
        Your profile is ready! Let's find your perfect roommate match.
      </Text>

      {error && (
        <Text style={{
          fontSize: 14,
          color: '#ef4444',
          textAlign: 'center',
          marginBottom: 16,
          backgroundColor: '#fee2e2',
          padding: 8,
          borderRadius: 4
        }}>
          {error}
        </Text>
      )}
    </View>
  )

  const canContinue = () => {
    switch (step) {
      case 1:
        return age && location
      case 2:
        return true // All fields optional
      case 3:
        return true // Preferences optional
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F5F1' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />

      <View style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 20
      }}>
        <View style={{
          backgroundColor: '#B7C8B5',
          borderWidth: 4,
          borderColor: '#004D40',
          borderRadius: 16,
          flex: 1,
          padding: 24,
          shadowColor: '#004D40',
          shadowOffset: { width: 8, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 8
        }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: '#44C76F',
              borderWidth: 4,
              borderColor: '#004D40',
              transform: [{ rotate: '3deg' }],
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <Text style={{
                color: '#004D40',
                fontWeight: '900',
                fontSize: 20,
                transform: [{ rotate: '-3deg' }]
              }}>
                R
              </Text>
            </View>

            {renderStepIndicator()}
          </View>

          {/* Content */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 24,
            gap: 12
          }}>
            {step > 1 && (
              <TouchableOpacity
                onPress={prevStep}
                style={{
                  flex: 1,
                  backgroundColor: '#ffffff',
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderWidth: 2,
                  borderColor: '#004D40',
                  borderRadius: 8
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#004D40',
                  textAlign: 'center'
                }}>
                  Back
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={step === 4 ? handleSubmit : nextStep}
              disabled={!canContinue() || loading}
              style={{
                flex: step === 1 ? 1 : 2,
                backgroundColor: '#004D40',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderWidth: 2,
                borderColor: '#004D40',
                borderRadius: 8,
                opacity: (!canContinue() || loading) ? 0.5 : 1
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#F2F5F1" />
              ) : (
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#F2F5F1',
                  textAlign: 'center'
                }}>
                  {step === 4 ? 'Complete Setup' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}