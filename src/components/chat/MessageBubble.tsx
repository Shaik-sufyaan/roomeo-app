/**
 * MessageBubble - React Native message bubble component with status indicators
 * Similar to WhatsApp/Instagram message styling for mobile
 */

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import type { ChatMessage, OptimisticMessage } from '../../types/chat'
import { formatTime } from '../../utils/dateUtils'

interface MessageBubbleProps {
  message: ChatMessage | OptimisticMessage
  isOwn: boolean
  showAvatar?: boolean
  isFirst?: boolean
  isLast?: boolean
  onRetry?: () => void
  onImageClick?: (imageUrl: string) => void
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = false,
  isFirst = false,
  isLast = false,
  onRetry,
  onImageClick
}: MessageBubbleProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const isOptimistic = 'isOptimistic' in message && message.isOptimistic
  const hasError = 'error' in message && message.error
  const isImage = message.message_type === 'image'

  /**
   * Render message status indicators
   */
  const renderStatusIcon = () => {
    if (!isOwn || isOptimistic) return null

    if (hasError) {
      return (
        <TouchableOpacity
          onPress={onRetry}
          style={{ marginLeft: 4 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
        </TouchableOpacity>
      )
    }

    if (message.is_read) {
      return (
        <View style={{ flexDirection: 'row', marginLeft: 4 }}>
          <Ionicons name="checkmark-done" size={16} color="#ffffff" />
        </View>
      )
    }

    if (message.is_delivered) {
      return (
        <View style={{ flexDirection: 'row', marginLeft: 4 }}>
          <Ionicons name="checkmark-done-outline" size={16} color="#ffffff" />
        </View>
      )
    }

    // Sent
    return (
      <View style={{ marginLeft: 4 }}>
        <Ionicons name="checkmark" size={16} color="#ffffff" />
      </View>
    )
  }

  /**
   * Render image message
   */
  const renderImageMessage = () => {
    if (!isImage || !message.image_url) return null

    return (
      <View style={{ position: 'relative' }}>
        {imageLoading && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: 8,
            zIndex: 1
          }}>
            <ActivityIndicator size="small" color="#9ca3af" />
          </View>
        )}

        {imageError ? (
          <View style={{
            width: 192,
            height: 128,
            backgroundColor: '#f3f4f6',
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Ionicons name="image-outline" size={32} color="#9ca3af" />
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
              Failed to load image
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => onImageClick?.(message.image_url!)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: message.image_url }}
              style={{
                width: 192,
                height: 256,
                borderRadius: 8,
                opacity: imageLoading ? 0 : 1
              }}
              contentFit="cover"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
          </TouchableOpacity>
        )}

        {message.content && (
          <Text style={{
            marginTop: 8,
            fontSize: 14,
            color: isOwn ? '#ffffff' : '#1f2937'
          }}>
            {message.content}
          </Text>
        )}
      </View>
    )
  }

  const bubbleStyles = {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: 280,
    backgroundColor: isOwn
      ? (isOptimistic ? '#60a5fa' : hasError ? '#ef4444' : '#3b82f6')
      : '#ffffff',
    borderWidth: isOwn ? 0 : 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    ...(isFirst && !isOwn && { borderTopLeftRadius: 4 }),
    ...(isFirst && isOwn && { borderTopRightRadius: 4 }),
    ...(isLast && !isOwn && { borderBottomLeftRadius: 4 }),
    ...(isLast && isOwn && { borderBottomRightRadius: 4 }),
  }

  return (
    <View style={{
      flexDirection: isOwn ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      marginBottom: 2,
      marginHorizontal: 16,
      maxWidth: '95%',
      alignSelf: isOwn ? 'flex-end' : 'flex-start'
    }}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <View style={{ marginRight: 8, marginBottom: 4 }}>
          <Image
            source={{
              uri: message.sender_avatar || 'https://via.placeholder.com/32x32/cccccc/666666?text=U'
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: '#ffffff'
            }}
            contentFit="cover"
          />
        </View>
      )}

      {/* Message bubble */}
      <View style={bubbleStyles}>
        {/* Sender name for group chats */}
        {!isOwn && showAvatar && isFirst && message.sender_name && (
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: '#6b7280',
            marginBottom: 4
          }}>
            {message.sender_name}
          </Text>
        )}

        {/* Message content */}
        <View>
          {isImage ? renderImageMessage() : (
            <Text style={{
              fontSize: 16,
              color: isOwn ? '#ffffff' : '#1f2937',
              lineHeight: 20
            }}>
              {message.content}
            </Text>
          )}
        </View>

        {/* Timestamp and status */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: 4
        }}>
          {/* Optimistic indicator */}
          {isOptimistic && (
            <ActivityIndicator
              size="small"
              color={isOwn ? '#ffffff' : '#6b7280'}
              style={{ marginRight: 4 }}
            />
          )}

          {/* Error indicator */}
          {hasError && (
            <Text style={{
              fontSize: 11,
              color: '#ffffff',
              marginRight: 4
            }}>
              Failed
            </Text>
          )}

          <Text style={{
            fontSize: 11,
            color: isOwn ? 'rgba(255, 255, 255, 0.75)' : '#9ca3af'
          }}>
            {formatTime(message.created_at)}
          </Text>

          {renderStatusIcon()}
        </View>
      </View>

      {/* Spacer for own messages when showing avatars */}
      {showAvatar && isOwn && <View style={{ width: 32, marginLeft: 8 }} />}
    </View>
  )
}

export default MessageBubble