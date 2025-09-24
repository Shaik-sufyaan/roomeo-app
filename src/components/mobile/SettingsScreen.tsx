/**
 * SettingsScreen - React Native settings screen
 * Comprehensive settings with profile visibility, account management, and danger zone
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabase'

interface User {
  id: string
  name?: string
  email?: string
  userType?: string
  profileVisible?: boolean
  role?: string
}

interface SettingsScreenProps {
  user: User
  onBack: () => void
  onUpgrade?: () => void
}

export default function SettingsScreen({ user, onBack, onUpgrade }: SettingsScreenProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [profileVisible, setProfileVisible] = useState(user?.profileVisible ?? true)
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false)

  const { logout } = useAuth()

  // Update local state when user prop changes
  useEffect(() => {
    setProfileVisible(user?.profileVisible ?? true)
  }, [user?.profileVisible])

  const handleToggleProfileVisibility = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User ID not found. Please refresh and try again.")
      return
    }

    setIsUpdatingVisibility(true)
    const newVisibility = !profileVisible

    try {
      console.log("🔄 Updating profile visibility:", {
        userId: user.id,
        currentVisibility: profileVisible,
        newVisibility
      })

      const { error } = await supabase
        .from('users')
        .update({ profilevisible: newVisibility })
        .eq('id', user.id)

      if (error) {
        console.error("❌ Failed to update profile visibility:", error)
        Alert.alert("Error", `Failed to update profile visibility: ${error.message}`)
        return
      }

      setProfileVisible(newVisibility)
      console.log("✅ Profile visibility updated successfully")

      // Show confirmation message
      const message = newVisibility
        ? "Profile activated! You can now browse and be discovered by others."
        : "Profile locked! You're now hidden from discovery and cannot browse others until you unhide."
      Alert.alert("Success", message)

    } catch (error: any) {
      console.error("❌ Exception updating profile visibility:", error)
      Alert.alert("Error", `Unexpected error: ${error.message || error}`)
    } finally {
      setIsUpdatingVisibility(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      Alert.alert("Error", "No user ID found. Please refresh and try again.")
      return
    }

    setIsDeleting(true)
    try {
      console.log("🔍 DEBUGGING ACCOUNT DELETION:")
      console.log("   - User object:", user)
      console.log("   - User ID:", user.id)

      // Step 1: Get current auth user to verify identity
      const { data: { user: authUser }, error: authCheckError } = await supabase.auth.getUser()
      console.log("   - Current auth user:", authUser?.id)

      if (authCheckError) {
        Alert.alert("Error", "Authentication error. Please sign in again and try.")
        return
      }

      if (!authUser || authUser.id !== user.id) {
        Alert.alert("Error", "User identity mismatch. Please sign out and sign in again.")
        return
      }

      // Step 2: Verify user exists in users table before deletion
      console.log("🔍 Checking if user exists in database...")
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', user.id)
        .single()

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          Alert.alert("Notice", "User record not found in database. You may already be deleted.")
          await logout()
          return
        } else {
          Alert.alert("Error", `Database check failed: ${checkError.message}`)
          return
        }
      }

      // Step 3: Attempt deletion
      console.log("🗑️ Attempting to delete user from users table...")
      const { data: deleteData, error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)
        .select()

      if (userError) {
        console.error("❌ DELETE failed with error:", userError)
        Alert.alert("Error", `Failed to delete account: ${userError.message}. Please contact support.`)
        return
      }

      // Step 4: Check if any rows were actually deleted
      if (!deleteData || deleteData.length === 0) {
        console.error("❌ DELETE succeeded but no rows were affected!")
        Alert.alert("Error", "Account deletion failed: No rows were deleted. Please contact support.")
        return
      }

      console.log(`✅ Successfully deleted ${deleteData.length} row(s) from users table`)

      // Step 5: Sign out the user
      console.log("🔄 Signing out user...")
      await logout()

      console.log("🎉 Account deletion completed!")
      Alert.alert("Success", "Account successfully deleted. You have been signed out.")

    } catch (error: any) {
      console.error("❌ Exception during account deletion:", error)
      Alert.alert("Error", `Unexpected error during account deletion: ${error.message || error}`)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const confirmDelete = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data, matches, and conversations.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: handleDeleteAccount
        }
      ]
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F5F1' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F5F1" />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F2F5F1',
        borderBottomWidth: 4,
        borderBottomColor: '#004D40'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={onBack}
            style={{
              backgroundColor: '#44C76F',
              borderWidth: 2,
              borderColor: '#004D40',
              borderRadius: 8,
              padding: 12,
              shadowColor: '#004D40',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 4
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#004D40" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 24,
            fontWeight: '900',
            color: '#004D40'
          }}>
            SETTINGS
          </Text>
        </View>

        <View style={{
          width: 24,
          height: 24,
          backgroundColor: '#44C76F',
          borderWidth: 2,
          borderColor: '#004D40',
          borderRadius: 4,
          transform: [{ rotate: '3deg' }],
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#004D40',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2
        }}>
          <Text style={{
            color: '#004D40',
            fontWeight: '900',
            fontSize: 12,
            transform: [{ rotate: '-3deg' }]
          }}>
            R
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={{
          backgroundColor: '#F2F5F1',
          borderWidth: 4,
          borderColor: '#004D40',
          borderRadius: 12,
          shadowColor: '#004D40',
          shadowOffset: { width: 8, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 8,
          padding: 24
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{
              width: 64,
              height: 64,
              backgroundColor: '#44C76F',
              borderWidth: 4,
              borderColor: '#004D40',
              borderRadius: 32,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#004D40',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 4
            }}>
              <Ionicons name="person" size={32} color="#004D40" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '900',
                color: '#004D40'
              }}>
                {user?.name || "User"}
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#44C76F'
              }}>
                {user?.email}
              </Text>
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#004D40'
              }}>
                {user?.role === "seeker" ? "Looking for Owners" : "Looking for Roommates"}
              </Text>
            </View>
          </View>
        </View>

        {/* Upgrade Section for Quick Access Users */}
        {user?.userType === 'quick_access' && (
          <View style={{
            backgroundColor: 'rgba(68, 199, 111, 0.1)',
            borderWidth: 4,
            borderColor: '#44C76F',
            borderRadius: 12,
            shadowColor: '#44C76F',
            shadowOffset: { width: 8, height: 8 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 8,
            padding: 24,
            alignItems: 'center'
          }}>
            <View style={{
              width: 64,
              height: 64,
              backgroundColor: '#44C76F',
              borderWidth: 4,
              borderColor: '#004D40',
              borderRadius: 32,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              shadowColor: '#004D40',
              shadowOffset: { width: 6, height: 6 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 6
            }}>
              <Ionicons name="lock-open" size={32} color="#004D40" />
            </View>

            <Text style={{
              fontSize: 20,
              fontWeight: '900',
              color: '#004D40',
              marginBottom: 12,
              textAlign: 'center'
            }}>
              🚀 UPGRADE TO FULL FEATURES
            </Text>

            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#004D40',
              marginBottom: 16,
              textAlign: 'center',
              lineHeight: 22
            }}>
              Unlock roommate matching, swiping, and access to the matches page!
            </Text>

            <View style={{
              backgroundColor: '#F2F5F1',
              borderWidth: 2,
              borderColor: '#004D40',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              width: '100%'
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '900',
                color: '#004D40',
                marginBottom: 8
              }}>
                ✨ YOU'LL GET ACCESS TO:
              </Text>
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#004D40' }}>
                  • Swipe through potential roommates
                </Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#004D40' }}>
                  • Match with compatible people
                </Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#004D40' }}>
                  • View detailed profiles & photos
                </Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#004D40' }}>
                  • Access the matches page
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (onUpgrade) {
                  onUpgrade()
                } else {
                  Alert.alert("Notice", "Upgrade functionality not available")
                }
              }}
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
                width: '100%',
                marginBottom: 12
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
              opacity: 0.7,
              textAlign: 'center'
            }}>
              Keep all your marketplace listings, expenses, and chat history!
            </Text>
          </View>
        )}

        {/* Account Section */}
        <View style={{
          backgroundColor: '#F2F5F1',
          borderWidth: 4,
          borderColor: '#004D40',
          borderRadius: 12,
          shadowColor: '#004D40',
          shadowOffset: { width: 6, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 6,
          padding: 16
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <Ionicons name="person" size={20} color="#004D40" />
            <Text style={{
              fontSize: 18,
              fontWeight: '900',
              color: '#004D40'
            }}>
              ACCOUNT
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              Alert.alert("Coming Soon", "Change password functionality coming soon!")
            }}
            style={{
              backgroundColor: 'white',
              borderWidth: 2,
              borderColor: '#004D40',
              borderRadius: 8,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              shadowColor: '#004D40',
              shadowOffset: { width: 3, height: 3 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 3
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark" size={16} color="#004D40" />
            <Text style={{
              fontSize: 16,
              fontWeight: '900',
              color: '#004D40'
            }}>
              CHANGE PASSWORD
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy & Security Section */}
        <View style={{
          backgroundColor: '#F2F5F1',
          borderWidth: 4,
          borderColor: '#004D40',
          borderRadius: 12,
          shadowColor: '#004D40',
          shadowOffset: { width: 6, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 6,
          padding: 16
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <Ionicons name="shield" size={20} color="#004D40" />
            <Text style={{
              fontSize: 18,
              fontWeight: '900',
              color: '#004D40'
            }}>
              PRIVACY & SECURITY
            </Text>
          </View>

          {/* Profile Visibility Toggle */}
          <View style={{
            backgroundColor: 'white',
            borderWidth: 4,
            borderColor: '#004D40',
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
            shadowColor: '#004D40',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 4
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderWidth: 2,
                  borderColor: '#004D40',
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: profileVisible ? '#44C76F' : '#FEF2F2',
                  shadowColor: '#004D40',
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2
                }}>
                  <Ionicons
                    name={profileVisible ? "eye" : "eye-off"}
                    size={20}
                    color={profileVisible ? "#004D40" : "#DC2626"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '900',
                    color: '#004D40'
                  }}>
                    {profileVisible ? 'PROFILE VISIBLE' : 'PROFILE HIDDEN'}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: 'rgba(0, 77, 64, 0.7)'
                  }}>
                    {profileVisible
                      ? 'You can browse and be discovered by others'
                      : 'Discovery blocked both ways'
                    }
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'center' }}>
                {isUpdatingVisibility && (
                  <ActivityIndicator size="small" color="#004D40" style={{ marginBottom: 4 }} />
                )}
                <Switch
                  value={profileVisible}
                  onValueChange={handleToggleProfileVisibility}
                  disabled={isUpdatingVisibility}
                  trackColor={{ false: '#DC2626', true: '#44C76F' }}
                  thumbColor={profileVisible ? '#004D40' : '#ffffff'}
                />
              </View>
            </View>

            {/* Status Description */}
            <View style={{
              marginTop: 12,
              padding: 8,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: profileVisible ? '#44C76F' : '#DC2626',
              backgroundColor: profileVisible ? 'rgba(68, 199, 111, 0.1)' : 'rgba(220, 38, 38, 0.1)'
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: profileVisible ? '#004D40' : '#DC2626'
              }}>
                {profileVisible ? (
                  <>
                    <Text style={{ fontWeight: '900' }}>ACTIVE:</Text> Your profile appears in discovery and you can browse others. Full access to matching features.
                  </>
                ) : (
                  <>
                    <Text style={{ fontWeight: '900' }}>LOCKED:</Text> Your profile is hidden from discovery AND you cannot browse other profiles. Complete privacy mode.
                  </>
                )}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              Alert.alert("Coming Soon", "Notification settings functionality coming soon!")
            }}
            style={{
              backgroundColor: 'white',
              borderWidth: 2,
              borderColor: '#004D40',
              borderRadius: 8,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              shadowColor: '#004D40',
              shadowOffset: { width: 3, height: 3 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 3
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications" size={16} color="#004D40" />
            <Text style={{
              fontSize: 16,
              fontWeight: '900',
              color: '#004D40'
            }}>
              NOTIFICATION SETTINGS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help & Support Section */}
        <View style={{
          backgroundColor: '#F2F5F1',
          borderWidth: 4,
          borderColor: '#004D40',
          borderRadius: 12,
          shadowColor: '#004D40',
          shadowOffset: { width: 6, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 6,
          padding: 16
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <Ionicons name="help-circle" size={20} color="#004D40" />
            <Text style={{
              fontSize: 18,
              fontWeight: '900',
              color: '#004D40'
            }}>
              HELP & SUPPORT
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              Alert.alert("Coming Soon", "Help & FAQ functionality coming soon!")
            }}
            style={{
              backgroundColor: 'white',
              borderWidth: 2,
              borderColor: '#004D40',
              borderRadius: 8,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              shadowColor: '#004D40',
              shadowOffset: { width: 3, height: 3 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 3
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="help-circle" size={16} color="#004D40" />
            <Text style={{
              fontSize: 16,
              fontWeight: '900',
              color: '#004D40'
            }}>
              HELP & FAQ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={{
          backgroundColor: '#F2F5F1',
          borderWidth: 4,
          borderColor: '#DC2626',
          borderRadius: 12,
          shadowColor: '#DC2626',
          shadowOffset: { width: 6, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 6,
          padding: 16
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <Ionicons name="trash" size={20} color="#DC2626" />
            <Text style={{
              fontSize: 18,
              fontWeight: '900',
              color: '#DC2626'
            }}>
              DANGER ZONE
            </Text>
          </View>

          <TouchableOpacity
            onPress={confirmDelete}
            disabled={isDeleting}
            style={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              borderWidth: 2,
              borderColor: '#DC2626',
              borderRadius: 8,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              shadowColor: '#DC2626',
              shadowOffset: { width: 3, height: 3 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 3,
              opacity: isDeleting ? 0.5 : 1
            }}
            activeOpacity={0.8}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Ionicons name="trash" size={16} color="#DC2626" />
            )}
            <Text style={{
              fontSize: 16,
              fontWeight: '900',
              color: '#DC2626'
            }}>
              {isDeleting ? "DELETING..." : "DELETE ACCOUNT"}
            </Text>
          </TouchableOpacity>

          <Text style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: '#DC2626',
            marginTop: 8,
            paddingLeft: 28
          }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}