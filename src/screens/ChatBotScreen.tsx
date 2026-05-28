// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { sendChatMessage, getChatHistory } from '../utils/api';

interface MessageItem {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatBotScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { user } = useUser();
  
  // 1. Pre-written greeting message ko yahan se remove kar diya hai (Ab state khali hai)
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList<MessageItem>>(null);

  const loadChatHistory = useCallback(async () => {
    try {
      if (!user?.id && !user?._id) {
        console.log('⏭️ Skipping: No user ID available');
        return;
      }

      const userId = user?.id || user?._id;
      console.log('📖 Loading chat history for userId:', userId);
      
      const data = await getChatHistory(userId, 50);
      console.log('📥 Chat history response:', data);

      if (data.success && data.data && Array.isArray(data.data)) {
        const loadedMessages: MessageItem[] = data.data.map((msg: any, index: number) => ({
          id: `${Date.now()}_${index}`,
          text: msg.content || msg.text || '',
          sender: msg.role === 'user' ? 'user' : 'bot',
        }));

        console.log('✅ Loaded messages:', loadedMessages.length);

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        }
      } else {
        console.log('ℹ️ No chat history available');
      }
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
    }
  }, [user?.id, user?._id]);

  // Load chat history on component mount
  useEffect(() => {
    if (user?.id || user?._id) {
      loadChatHistory();
    }
  }, [user?.id, user?._id, loadChatHistory]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    
    const userId = user?.id || user?._id;
    console.log('🔍 Debug - userId:', userId);
    console.log('🔍 Debug - user object:', user);
    
    if (!userId) {
      console.warn('❌ User not logged in');
      const errorMsg: MessageItem = {
        id: Date.now().toString(),
        text: 'Please log in first to use the chatbot.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const userMessage: MessageItem = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      console.log('📤 Sending message...');
      const data = await sendChatMessage(userId, userMessage.text);
      
      console.log('📥 Response received:', data);

      if (data.success) {
        const botResponse: MessageItem = {
          id: (Date.now() + 1).toString(),
          text: data.response || 'Thank you for your message.',
          sender: 'bot',
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      } else {
        let errorText = data.response || data.message || 'An error occurred. Please try again.';
        
        if (data.emergency) {
          errorText = '🚨 ' + errorText;
        }
        
        const errorMessage: MessageItem = {
          id: (Date.now() + 1).toString(),
          text: errorText,
          sender: 'bot',
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      const errorMessage: MessageItem = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error.message || 'Connection failed. Please check your internet and try again.'}`,
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: MessageItem }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
        {!isUser && (
          <View style={[styles.botIconCircle, { backgroundColor: theme.secondary }]}>
            <Icon name="hardware-chip-outline" size={14} color="#fff" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? { backgroundColor: theme.primary } : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={[theme.primary, theme.secondary, theme.background]} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Top Header Match Theme */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MindGuard AI Chatbot</Text>
        <Text style={styles.headerSubtitle}>Always here to listen and support</Text>
      </View>

      {/* Chat History */}
      <FlatList<MessageItem>
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Box Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message here..."
            placeholderTextColor="#A0AEC0"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!loading}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              { backgroundColor: theme.primary },
              loading && styles.sendButtonDisabled
            ]} 
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* --- CUSTOM BOTTOM TAB BAR MATCHED WITH DASHBOARD --- */}
      <View style={styles.tabContainer}>
        <View style={styles.bottomTabsContainer}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
            <Icon name="home-outline" size={24} color="#718096" />
            <Text style={styles.tabLabel}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ChatBot')}>
            <Icon name="chatbubble" size={22} color={theme.primary} />
            <Text style={[styles.tabLabel, { color: theme.primary }]}>Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Doctor')}>
            <Icon name="medical-outline" size={24} color="#718096" />
            <Text style={styles.tabLabel}>Doctor</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
            <Icon name="person-outline" size={22} color="#718096" />
            <Text style={styles.tabLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    // 3. Padding barha di taake response message input box ke upar khula khula dikhayi de
    paddingBottom: 170, 
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botRow: {
    alignSelf: 'flex-start',
  },
  botIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#2D3748',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    // 2. bottom property ko 95 se barha kar 110 kiya taake tabs se gap pyara lage
    bottom: 110, 
    marginHorizontal: 20,
    borderRadius: 20,
    position: 'absolute',
    left: 0,
    right: 0,
    elevation: 5,
  },
  input: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: '#2D3748',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  tabContainer: { position: 'absolute', bottom: 25, left: 20, right: 20 },
  bottomTabsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 70, borderRadius: 30, backgroundColor: 'white', elevation: 10 },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 10, color: '#718096' },
});