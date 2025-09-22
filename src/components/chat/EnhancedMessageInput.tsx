/**
 * EnhancedMessageInput - React Native enhanced message input with mentions, file upload, and quick actions
 */

import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import type { MessageInputProps, MentionSuggestion } from '../../types/enhanced-chat'

export default function EnhancedMessageInput({
  value,
  onChange,
  onSend,
  onFileUpload,
  chatUsers,
  disabled = false,
  placeholder = "Type your message..."
}: MessageInputProps) {
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 })
  const [isUploading, setIsUploading] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [inputHeight, setInputHeight] = useState(44)

  const textInputRef = useRef<TextInput>(null)

  // Handle mention detection
  useEffect(() => {
    const cursorPosition = value.length // React Native doesn't have cursor position easily available
    const textBeforeCursor = value
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      setMentionSearch(mentionMatch[1])
      setMentionPosition({
        start: cursorPosition - mentionMatch[0].length,
        end: cursorPosition
      })
      setShowMentions(true)
    } else {
      setShowMentions(false)
    }
  }, [value])

  const filteredUsers = chatUsers.filter(user =>
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  )

  const handleMentionSelect = (user: MentionSuggestion) => {
    const beforeMention = value.slice(0, mentionPosition.start)
    const afterMention = value.slice(mentionPosition.end)
    const newValue = beforeMention + `@${user.name} ` + afterMention

    onChange(newValue)
    setShowMentions(false)

    // Focus back to text input
    setTimeout(() => {
      textInputRef.current?.focus()
    }, 0)
  }

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend()
    }
  }

  const handleFileSelect = async () => {
    setIsUploading(true)
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'text/*'],
        copyToCacheDirectory: true
      })

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0]
        await onFileUpload(file.uri, file.name, file.mimeType || 'application/octet-stream')
      }
    } catch (error) {
      console.error('Error selecting file:', error)
      Alert.alert('Error', 'Failed to select file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleContentSizeChange = (event: any) => {
    const newHeight = Math.min(Math.max(44, event.nativeEvent.contentSize.height), 120)
    setInputHeight(newHeight)
  }

  const quickActions = [
    {
      id: 'poll',
      icon: '📊',
      title: 'Create Poll',
      onPress: () => {
        setShowActions(false)
        // TODO: Open poll creation modal
        Alert.alert('Feature Coming Soon', 'Poll creation will be available soon!')
      }
    },
    {
      id: 'chore',
      icon: '🧹',
      title: 'Assign Chore',
      onPress: () => {
        setShowActions(false)
        // TODO: Open chore assignment modal
        Alert.alert('Feature Coming Soon', 'Chore assignment will be available soon!')
      }
    },
    {
      id: 'expense',
      icon: '💰',
      title: 'Split Expense',
      onPress: () => {
        setShowActions(false)
        // TODO: Open expense split modal
        Alert.alert('Feature Coming Soon', 'Expense splitting will be available soon!')
      }
    },
    {
      id: 'reminder',
      icon: '⚡',
      title: 'Set Reminder',
      onPress: () => {
        setShowActions(false)
        // TODO: Open bill reminder modal
        Alert.alert('Feature Coming Soon', 'Bill reminders will be available soon!')
      }
    }
  ]

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={{ position: 'relative' }}>
        {/* Mention Suggestions Modal */}
        <Modal
          visible={showMentions && filteredUsers.length > 0}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMentions(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              justifyContent: 'flex-end'
            }}
            activeOpacity={1}
            onPress={() => setShowMentions(false)}
          >
            <View style={{
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              padding: 16,
              maxHeight: 300
            }}>
              <Text style={{
                fontSize: 12,
                color: '#004D40',
                marginBottom: 12,
                fontWeight: '600'
              }}>
                Mention someone
              </Text>
              <ScrollView style={{ maxHeight: 200 }}>
                {filteredUsers.map(user => (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => handleMentionSelect(user)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      marginBottom: 4
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#f0f9ff',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      {user.avatar ? (
                        <Image
                          source={{ uri: user.avatar }}
                          style={{ width: 32, height: 32, borderRadius: 16 }}
                          contentFit="cover"
                        />
                      ) : (
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#004D40'
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={{
                      fontSize: 16,
                      color: '#1f2937',
                      flex: 1
                    }}>
                      {user.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Quick Actions Modal */}
        <Modal
          visible={showActions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowActions(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              justifyContent: 'flex-end'
            }}
            activeOpacity={1}
            onPress={() => setShowActions(false)}
          >
            <View style={{
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              padding: 16
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: 16
              }}>
                Quick Actions
              </Text>
              {quickActions.map(action => (
                <TouchableOpacity
                  key={action.id}
                  onPress={action.onPress}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    marginBottom: 4
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>
                    {action.icon}
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#004D40',
                    flex: 1
                  }}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Message Input Container */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: 'rgba(4, 77, 64, 0.3)',
          backgroundColor: '#ffffff',
          gap: 12
        }}>
          {/* Action Buttons */}
          <View style={{ flexDirection: 'column', gap: 8 }}>
            <TouchableOpacity
              onPress={handleFileSelect}
              disabled={disabled || isUploading}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(4, 77, 64, 0.1)',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: disabled || isUploading ? 0.5 : 1
              }}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#004D40" />
              ) : (
                <Ionicons name="attach" size={20} color="#004D40" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowActions(!showActions)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(4, 77, 64, 0.1)',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons
                name={showActions ? "close" : "add"}
                size={20}
                color="#004D40"
              />
            </TouchableOpacity>
          </View>

          {/* Text Input */}
          <View style={{ flex: 1, position: 'relative' }}>
            <TextInput
              ref={textInputRef}
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              editable={!disabled}
              onContentSizeChange={handleContentSizeChange}
              style={{
                borderWidth: 2,
                borderColor: 'rgba(4, 77, 64, 0.3)',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 16,
                minHeight: 44,
                height: inputHeight,
                maxHeight: 120,
                backgroundColor: '#ffffff',
                color: '#1f2937'
              }}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />

            {/* Character Count */}
            {value.length > 800 && (
              <Text style={{
                position: 'absolute',
                bottom: 4,
                right: 8,
                fontSize: 12,
                color: value.length > 1000 ? '#ef4444' : '#004D40'
              }}>
                {value.length}/1000
              </Text>
            )}
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={!value.trim() || disabled}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: value.trim() && !disabled ? '#004D40' : '#d1d5db',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons
              name="send"
              size={20}
              color={value.trim() && !disabled ? '#ffffff' : '#9ca3af'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}