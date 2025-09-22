/**
 * ChatInput - React Native chat input component with typing detection and image upload
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { pickImage } from '../../utils'

interface ChatInputProps {
  onSendMessage: (message: string, type?: 'text' | 'image', imageUrl?: string) => Promise<void>
  onTyping?: (isTyping: boolean) => void
  onImageUpload?: (uri: string) => Promise<string>
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}

export function ChatInput({
  onSendMessage,
  onTyping,
  onImageUpload,
  placeholder = "Type a message...",
  disabled = false,
  maxLength = 1000
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const inputRef = useRef<TextInput>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const lastTypingTime = useRef<number>(0)

  /**
   * Handle typing detection with debouncing
   */
  const handleTypingStart = useCallback(() => {
    const now = Date.now()
    lastTypingTime.current = now

    if (!isTyping) {
      setIsTyping(true)
      onTyping?.(true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (Date.now() - lastTypingTime.current >= 2000) {
        setIsTyping(false)
        onTyping?.(false)
      }
    }, 2000)
  }, [isTyping, onTyping])

  /**
   * Handle typing stop
   */
  const handleTypingStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (isTyping) {
      setIsTyping(false)
      onTyping?.(false)
    }
  }, [isTyping, onTyping])

  /**
   * Handle input change
   */
  const handleInputChange = (value: string) => {
    if (value.length <= maxLength) {
      setMessage(value)

      if (value.trim()) {
        handleTypingStart()
      } else {
        handleTypingStop()
      }
    }
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    const trimmedMessage = message.trim()

    if ((!trimmedMessage && !uploadedImageUrl) || isSending || disabled) {
      return
    }

    try {
      setIsSending(true)
      handleTypingStop()

      if (uploadedImageUrl) {
        // Send image message
        await onSendMessage(trimmedMessage || '📷 Image', 'image', uploadedImageUrl)
        setUploadedImageUrl(null)
        setImagePreview(null)
      } else {
        // Send text message
        await onSendMessage(trimmedMessage)
      }

      setMessage('')

      // Focus back to input
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)

    } catch (error) {
      console.error('Failed to send message:', error)
      Alert.alert('Error', 'Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  /**
   * Handle image selection
   */
  const handleImageSelect = async () => {
    if (!onImageUpload) return

    try {
      const result = await pickImage({
        allowsEditing: true,
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000
      })

      if (result && !result.cancelled && result.uri) {
        setIsUploading(true)
        setImagePreview(result.uri)

        // Upload image
        const uploadedUrl = await onImageUpload(result.uri)
        setUploadedImageUrl(uploadedUrl)
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      Alert.alert('Error', 'Failed to upload image. Please try again.')
      setImagePreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Remove image preview
   */
  const removeImagePreview = () => {
    setImagePreview(null)
    setUploadedImageUrl(null)
  }

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const hasContent = message.trim() || uploadedImageUrl
  const charactersRemaining = maxLength - message.length

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={{
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        padding: 16
      }}>
        {/* Image preview */}
        {imagePreview && (
          <View style={{ marginBottom: 12 }}>
            <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
              <Image
                source={{ uri: imagePreview }}
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e5e7eb'
                }}
                contentFit="cover"
              />

              {isUploading && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 8
                }}>
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              )}

              <TouchableOpacity
                onPress={removeImagePreview}
                disabled={isUploading}
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 24,
                  height: 24,
                  backgroundColor: '#ef4444',
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="close" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          {/* Image upload button */}
          {onImageUpload && (
            <TouchableOpacity
              onPress={handleImageSelect}
              disabled={disabled || isUploading}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: disabled || isUploading ? '#f3f4f6' : '#f9fafb'
              }}
            >
              <Ionicons
                name="camera"
                size={24}
                color={disabled || isUploading ? '#9ca3af' : '#6b7280'}
              />
            </TouchableOpacity>
          )}

          {/* Text input container */}
          <View style={{ flex: 1, position: 'relative' }}>
            <TextInput
              ref={inputRef}
              value={message}
              onChangeText={handleInputChange}
              placeholder={placeholder}
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              editable={!disabled && !isSending}
              style={{
                borderWidth: 1,
                borderColor: charactersRemaining < 0 ? '#ef4444' :
                           charactersRemaining < 50 ? '#f59e0b' : '#d1d5db',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                maxHeight: 120,
                backgroundColor: '#ffffff',
                color: '#1f2937'
              }}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              blurOnSubmit={false}
            />

            {/* Character counter */}
            {maxLength && message.length > maxLength * 0.8 && (
              <Text style={{
                position: 'absolute',
                top: -20,
                right: 0,
                fontSize: 12,
                color: charactersRemaining < 0 ? '#ef4444' :
                       charactersRemaining < 50 ? '#f59e0b' : '#6b7280'
              }}>
                {charactersRemaining < 0
                  ? `${-charactersRemaining} over limit`
                  : `${charactersRemaining} left`
                }
              </Text>
            )}
          </View>

          {/* Send button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!hasContent || isSending || disabled || isUploading}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: hasContent && !isSending && !disabled && !isUploading
                ? '#3b82f6'
                : '#d1d5db',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={hasContent && !disabled && !isUploading ? '#ffffff' : '#9ca3af'}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Typing indicator for current user */}
        {isTyping && (
          <Text style={{
            marginTop: 8,
            fontSize: 12,
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            You are typing...
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

export default ChatInput