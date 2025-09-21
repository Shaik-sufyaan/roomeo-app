// components/mobile/ChatDetailScreen.tsx - Individual chat conversation screen
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  isOwn: boolean;
}

interface ChatDetailScreenProps {
  chatId: string;
  chatPartner: {
    id: string;
    name: string;
    imageUrl: string;
    isOnline: boolean;
  };
  onBack: () => void;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({
  chatId,
  chatPartner,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! I saw your profile and I think we could be great roommates!',
      timestamp: new Date(Date.now() - 3600000),
      senderId: chatPartner.id,
      isOwn: false,
    },
    {
      id: '2',
      text: 'That sounds awesome! Tell me more about the apartment.',
      timestamp: new Date(Date.now() - 3000000),
      senderId: 'current-user',
      isOwn: true,
    },
    {
      id: '3',
      text: 'It\'s a 2BR near MARTA, great natural light, and the rent is $800/month per person.',
      timestamp: new Date(Date.now() - 2400000),
      senderId: chatPartner.id,
      isOwn: false,
    },
    {
      id: '4',
      text: 'Perfect! When can we schedule a tour?',
      timestamp: new Date(Date.now() - 120000),
      senderId: 'current-user',
      isOwn: true,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        timestamp: new Date(),
        senderId: 'current-user',
        isOwn: true,
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      // Simulate partner typing and response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          'That works for me!',
          'Sounds good 👍',
          'Let me check my schedule',
          'I\'ll get back to you on that',
        ];

        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          senderId: chatPartner.id,
          isOwn: false,
        };

        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isOwn ? styles.ownMessage : styles.partnerMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isOwn ? styles.ownBubble : styles.partnerBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isOwn ? styles.ownMessageText : styles.partnerMessageText
        ]}>
          {item.text}
        </Text>
      </View>
      <Text style={[
        styles.messageTime,
        item.isOwn ? styles.ownMessageTime : styles.partnerMessageTime
      ]}>
        {formatTime(item.timestamp)}
      </Text>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.partnerMessage]}>
      <View style={[styles.messageBubble, styles.partnerBubble, styles.typingBubble]}>
        <Text style={styles.typingText}>typing...</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image source={{ uri: chatPartner.imageUrl }} style={styles.headerImage} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{chatPartner.name}</Text>
            <Text style={styles.headerStatus}>
              {chatPartner.isOnline ? '🟢 Online' : '⚫ Offline'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => Alert.alert('Options', 'Chat options will be implemented soon!')}
        >
          <Text style={styles.menuButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isTyping ? renderTypingIndicator : null}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#44C76F',
  },
  headerInfo: {
    marginLeft: 8,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  menuButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  partnerMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
  },
  ownBubble: {
    backgroundColor: '#44C76F',
    borderColor: '#004D40',
    borderBottomRightRadius: 4,
  },
  partnerBubble: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    backgroundColor: '#F3F4F6',
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#004D40',
  },
  partnerMessageText: {
    color: '#374151',
  },
  typingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#6B7280',
    textAlign: 'right',
  },
  partnerMessageTime: {
    color: '#9CA3AF',
    textAlign: 'left',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 18,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  sendButtonActive: {
    backgroundColor: '#44C76F',
    borderColor: '#004D40',
  },
  sendButtonInactive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
  },
});