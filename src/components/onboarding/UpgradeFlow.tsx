/**
 * UpgradeFlow - React Native upgrade flow component
 * Converts quick_access users to full provider/seeker accounts
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { updateUserProfile } from '../../services/supabase'

interface UpgradeFlowProps {
  onComplete: () => void
  onCancel: () => void
}

export default function UpgradeFlow({ onComplete, onCancel }: UpgradeFlowProps) {
  const { user, refreshUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedUserType, setSelectedUserType] = useState<"provider" | "seeker" | null>(null)
  const [budget, setBudget] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUserTypeSelection = (userType: "provider" | "seeker") => {
    setSelectedUserType(userType)
    setCurrentStep(2) // Go to budget step
  }

  const handleBudgetComplete = () => {
    setCurrentStep(3) // Go to final confirmation
  }

  const handleFinalUpgrade = async () => {
    if (!user || !selectedUserType) {
      setError("Missing required information for upgrade")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🚀 Starting upgrade process:", {
        userId: user.id,
        currentUserType: user.userType,
        newUserType: selectedUserType,
        budget: budget
      })

      // Prepare upgrade data
      const upgradeData = {
        usertype: selectedUserType,
        budget: budget ? Number(budget) : user.budget || 0,
        upgraded_at: new Date().toISOString(),
        original_signup_type: user.userType, // Track they were originally quick_access
        profile_completion_status: {}, // Clear completion status
      }

      console.log("🔄 Updating user profile with upgrade data:", upgradeData)

      // Update user profile in database
      const success = await updateUserProfile(user.id, upgradeData)

      if (!success) {
        throw new Error("Failed to upgrade profile")
      }

      console.log("✅ Profile upgrade completed successfully")

      // Refresh user data to reflect the upgrade
      await refreshUser?.()

      Alert.alert(
        'Upgrade Complete!',
        `Welcome to full Roomio access! You can now ${selectedUserType === 'provider' ? 'find roommates for your place' : 'search for places to live'}.`,
        [{ text: 'Continue', onPress: onComplete }]
      )

    } catch (error) {
      console.error("❌ Upgrade failed:", error)
      setError("Failed to upgrade your account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 24,
      gap: 8
    }}>
      {[1, 2, 3].map((stepNum) => (
        <View
          key={stepNum}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: currentStep >= stepNum ? '#44C76F' : '#d1d5db',
            borderWidth: 2,
            borderColor: '#004D40'
          }}
        />
      ))}
    </View>
  )

  const renderUserTypeSelection = () => (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View style={{
          padding: 16,
          backgroundColor: '#44C76F',
          borderRadius: 50,
          borderWidth: 4,
          borderColor: '#004D40',
          marginBottom: 16
        }}>
          <Ionicons name="sparkles" size={32} color="#004D40" />
        </View>

        <Text style={{
          fontSize: 28,
          fontWeight: '900',
          color: '#004D40',
          textAlign: 'center',
          marginBottom: 8,
          transform: [{ skewX: '-1deg' }]
        }}>
          UPGRADE TO FULL ACCESS
        </Text>

        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#004D40',
          textAlign: 'center',
          marginBottom: 24
        }}>
          Get access to roommate matching and advanced features
        </Text>
      </View>

      {/* User Type Options */}
      <View style={{ gap: 16 }}>
        <TouchableOpacity
          onPress={() => handleUserTypeSelection("provider")}
          style={{
            padding: 24,
            borderWidth: 4,
            borderColor: '#004D40',
            borderRadius: 12,
            backgroundColor: '#F2F5F1',
            shadowColor: '#004D40',
            shadowOffset: { width: 6, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 6
          }}
          activeOpacity={0.8}
        >
          <View style={{ alignItems: 'center' }}>
            <View style={{
              width: 60,
              height: 60,
              backgroundColor: '#44C76F',
              borderRadius: 30,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: '#004D40',
              marginBottom: 16
            }}>
              <Ionicons name="home" size={28} color="#004D40" />
            </View>

            <Text style={{
              fontSize: 20,
              fontWeight: '900',
              color: '#004D40',
              marginBottom: 8,
              transform: [{ skewX: '-1deg' }]
            }}>
              I HAVE A PLACE
            </Text>

            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#004D40',
              textAlign: 'center'
            }}>
              Find roommates to share your space
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleUserTypeSelection("seeker")}
          style={{
            padding: 24,
            borderWidth: 4,
            borderColor: '#004D40',
            borderRadius: 12,
            backgroundColor: '#F2F5F1',
            shadowColor: '#004D40',
            shadowOffset: { width: 6, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 6
          }}
          activeOpacity={0.8}
        >
          <View style={{ alignItems: 'center' }}>
            <View style={{
              width: 60,
              height: 60,
              backgroundColor: '#44C76F',
              borderRadius: 30,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: '#004D40',
              marginBottom: 16
            }}>
              <Ionicons name="search" size={28} color="#004D40" />
            </View>

            <Text style={{
              fontSize: 20,
              fontWeight: '900',
              color: '#004D40',
              marginBottom: 8,
              transform: [{ skewX: '-1deg' }]
            }}>
              I'M LOOKING FOR A PLACE
            </Text>

            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#004D40',
              textAlign: 'center'
            }}>
              Find places to share with others
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderBudgetStep = () => (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View style={{
          padding: 16,
          backgroundColor: '#44C76F',
          borderRadius: 50,
          borderWidth: 4,
          borderColor: '#004D40',
          marginBottom: 16
        }}>
          <Ionicons name="cash" size={32} color="#004D40" />
        </View>

        <Text style={{
          fontSize: 24,
          fontWeight: '900',
          color: '#004D40',
          textAlign: 'center',
          marginBottom: 8,
          transform: [{ skewX: '-1deg' }]
        }}>
          SET YOUR BUDGET
        </Text>

        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#004D40',
          textAlign: 'center',
          marginBottom: 32
        }}>
          Help us show you relevant {selectedUserType === 'provider' ? 'roommates' : 'places'}
        </Text>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#004D40',
          marginBottom: 12
        }}>
          Monthly Budget ($)
        </Text>

        <TextInput
          value={budget}
          onChangeText={setBudget}
          placeholder="Enter your monthly budget"
          keyboardType="numeric"
          style={{
            borderWidth: 3,
            borderColor: '#004D40',
            borderRadius: 12,
            paddingHorizontal: 20,
            paddingVertical: 16,
            fontSize: 18,
            backgroundColor: '#ffffff',
            fontWeight: 'bold'
          }}
        />

        <Text style={{
          fontSize: 14,
          color: '#6b7280',
          marginTop: 8,
          fontWeight: '500'
        }}>
          {selectedUserType === 'provider'
            ? 'This helps us find roommates who can afford your rent'
            : 'This helps us find places within your price range'
          }
        </Text>
      </View>
    </View>
  )

  const renderFinalStep = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        padding: 20,
        backgroundColor: '#44C76F',
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#004D40',
        marginBottom: 24
      }}>
        <Ionicons name="checkmark-circle" size={48} color="#004D40" />
      </View>

      <Text style={{
        fontSize: 24,
        fontWeight: '900',
        color: '#004D40',
        textAlign: 'center',
        marginBottom: 16,
        transform: [{ skewX: '-1deg' }]
      }}>
        READY FOR FULL ACCESS!
      </Text>

      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#004D40',
        textAlign: 'center',
        marginBottom: 8
      }}>
        You're upgrading to: {selectedUserType === 'provider' ? 'Place Owner' : 'Place Seeker'}
      </Text>

      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#004D40',
        textAlign: 'center',
        marginBottom: 32
      }}>
        Budget: ${budget}/month
      </Text>

      {error && (
        <Text style={{
          fontSize: 14,
          color: '#ef4444',
          textAlign: 'center',
          marginBottom: 16,
          backgroundColor: '#fee2e2',
          padding: 12,
          borderRadius: 8,
          fontWeight: 'bold'
        }}>
          {error}
        </Text>
      )}

      <Text style={{
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 20
      }}>
        Your account will be upgraded and you'll get access to roommate matching,
        advanced search, and all premium features.
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F5F1' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />

      <View style={{
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 20
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <TouchableOpacity
            onPress={onCancel}
            style={{
              padding: 8,
              marginRight: 16
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#004D40" />
          </TouchableOpacity>

          <Text style={{
            fontSize: 18,
            fontWeight: '900',
            color: '#004D40',
            flex: 1
          }}>
            UPGRADE ACCOUNT
          </Text>
        </View>

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
          {renderStepIndicator()}

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {currentStep === 1 && renderUserTypeSelection()}
            {currentStep === 2 && renderBudgetStep()}
            {currentStep === 3 && renderFinalStep()}
          </ScrollView>

          {/* Navigation */}
          {currentStep > 1 && currentStep < 3 && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 24,
              gap: 12
            }}>
              <TouchableOpacity
                onPress={() => setCurrentStep(currentStep - 1)}
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

              <TouchableOpacity
                onPress={currentStep === 2 ? handleBudgetComplete : undefined}
                disabled={currentStep === 2 && !budget}
                style={{
                  flex: 2,
                  backgroundColor: '#004D40',
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderWidth: 2,
                  borderColor: '#004D40',
                  borderRadius: 8,
                  opacity: (currentStep === 2 && !budget) ? 0.5 : 1
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#F2F5F1',
                  textAlign: 'center'
                }}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStep === 3 && (
            <TouchableOpacity
              onPress={handleFinalUpgrade}
              disabled={loading}
              style={{
                backgroundColor: '#004D40',
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderWidth: 2,
                borderColor: '#004D40',
                borderRadius: 8,
                marginTop: 24,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#F2F5F1" />
              ) : (
                <Text style={{
                  fontSize: 18,
                  fontWeight: '900',
                  color: '#F2F5F1',
                  textAlign: 'center'
                }}>
                  COMPLETE UPGRADE
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}