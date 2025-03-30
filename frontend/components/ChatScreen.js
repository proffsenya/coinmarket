import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';

const ChatScreen = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const flatListRef = useRef(null);
    const navigation = useNavigation();
  
    // Добавляем автоматическую прокрутку при новых сообщениях
    useEffect(() => {
      if (messages.length > 0) {
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    }, [messages]);
  
    const handleSend = async () => {
      if (!inputText.trim()) return;
  
      const newMessage = {
        id: Date.now(),
        text: inputText,
        isUser: true,
        timestamp: new Date().toISOString()
      };
  
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setIsLoading(true);
  
      try {
        // Исправляем URL для Android эмулятора
        const response = await axios.post('http://localhost:8000/chat', {
          message: inputText,
          user_id: user?.id
        });
  
        console.log('AI Response:', response.data); // Логируем ответ
  
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          isUser: false,
          timestamp: new Date().toISOString()
        };
  
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Chat error:', error.response?.data || error.message);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: 'Ошибка соединения с ИИ. Проверьте подключение.',
          isUser: false,
          timestamp: new Date().toISOString()
        }]);
      } finally {
        setIsLoading(false); // Гарантированно снимаем флаг загрузки
      }
    };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Чат с ИИ</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.isUser ? styles.userBubble : styles.aiBubble
          ]}>
            <Text style={[item.isUser ? styles.messageText : styles.messageTextAI]}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Напишите ваш вопрос..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={isLoading}
        >
          <Icon 
            name={isLoading ? "hourglass-empty" : "send"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop:70,
    flex: 1,
    backgroundColor: '#F5F6FA',
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  messagesContainer: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#273AA4',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  messageTextAI: {
    fontSize: 16,
    color: '#333',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#273AA4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;