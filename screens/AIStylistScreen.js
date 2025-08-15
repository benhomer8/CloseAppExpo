import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function AIStylistScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [clothingItems, setClothingItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadData();
    // Add welcome message
    setMessages([
      {
        id: 'welcome',
        type: 'ai',
        text: "Hi! I'm your AI stylist. I can help you create outfits, suggest combinations, and give fashion advice. What would you like help with today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const loadData = async () => {
    try {
      const [itemsData, outfitsData] = await Promise.all([
        AsyncStorage.getItem('clothingItems'),
        AsyncStorage.getItem('outfits'),
      ]);

      if (itemsData) {
        setClothingItems(JSON.parse(itemsData));
      }
      if (outfitsData) {
        setOutfits(JSON.parse(outfitsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      generateAIResponse(userMessage.text);
    }, 1000);
  };

  const generateAIResponse = async (userInput) => {
    try {
      let response;

      if (userInput.toLowerCase().includes('outfit') || userInput.toLowerCase().includes('suggest')) {
        response = await getAISuggestionsFromLibrary(userInput);
      } else if (userInput.toLowerCase().includes('weather') || userInput.toLowerCase().includes('season')) {
        response = await getWeatherBasedSuggestions(userInput);
      } else if (userInput.toLowerCase().includes('occasion') || userInput.toLowerCase().includes('event')) {
        response = await getOccasionBasedSuggestions(userInput);
      } else {
        response = await getGeneralFashionAdvice(userInput);
      }

      const aiMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        text: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      const errorMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Placeholder function for AI suggestions from library
  const getAISuggestionsFromLibrary = async (userInput) => {
    // This would normally call your AI backend
    // For now, return mock suggestions based on available items
    
    if (clothingItems.length === 0) {
      return "I don't see any clothing items in your closet yet. Try uploading some outfits first!";
    }

    const tops = clothingItems.filter(item => item.type === 'top');
    const bottoms = clothingItems.filter(item => item.type === 'bottom');
    const dresses = clothingItems.filter(item => item.type === 'dress');

    let suggestion = "Based on your closet, here are some outfit suggestions:\n\n";

    if (tops.length > 0 && bottoms.length > 0) {
      const randomTop = tops[Math.floor(Math.random() * tops.length)];
      const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      
      suggestion += `💡 **Casual Look**: ${randomTop.tags.join(', ')} top with ${randomBottom.tags.join(', ')} bottom\n`;
    }

    if (dresses.length > 0) {
      const randomDress = dresses[Math.floor(Math.random() * dresses.length)];
      suggestion += `💡 **Dress Up**: ${randomDress.tags.join(', ')} dress - perfect for any occasion!\n`;
    }

    suggestion += `\nYou have ${clothingItems.length} items in your closet. Want me to suggest more combinations?`;

    return suggestion;
  };

  // Placeholder function for weather-based suggestions
  const getWeatherBasedSuggestions = async (userInput) => {
    const suggestions = [
      "☀️ **Summer Style**: Light fabrics, breathable materials, and bright colors work great in warm weather. Consider cotton tops and flowy skirts!",
      "❄️ **Winter Warmth**: Layer up with cozy sweaters, warm jackets, and comfortable bottoms. Don't forget accessories like scarves and gloves!",
      "🌧️ **Rainy Days**: Water-resistant materials, comfortable shoes, and layers that can handle temperature changes are your best friends.",
      "🍂 **Fall Fashion**: Rich colors, medium-weight fabrics, and versatile pieces that can transition from day to evening."
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  // Placeholder function for occasion-based suggestions
  const getOccasionBasedSuggestions = async (userInput) => {
    const suggestions = [
      "💼 **Work/Office**: Professional pieces like blazers, tailored pants, and classic tops. Stick to neutral colors and clean lines.",
      "🎉 **Party/Evening**: Dress to impress! Consider your best dresses, statement pieces, and accessories that make you feel confident.",
      "🏠 **Casual/Weekend**: Comfort is key! Think soft fabrics, relaxed fits, and pieces that reflect your personal style.",
      "💒 **Special Events**: Choose pieces that make you feel beautiful and confident. Consider the dress code and venue when selecting your outfit."
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  // Placeholder function for general fashion advice
  const getGeneralFashionAdvice = async (userInput) => {
    const advice = [
      "✨ **Style Tip**: The best outfit is one that makes you feel confident and comfortable. Trust your instincts!",
      "🎨 **Color Theory**: Consider your skin tone and hair color when choosing colors. Some shades will naturally complement you better.",
      "📏 **Fit Matters**: Well-fitted clothes look more polished than oversized or too-tight pieces. Tailoring can make a huge difference!",
      "🔄 **Mix & Match**: Build a versatile wardrobe with pieces that can be mixed and matched to create multiple outfits.",
      "💎 **Accessorize**: Don't underestimate the power of accessories! Jewelry, scarves, and bags can transform a simple outfit."
    ];

    return advice[Math.floor(Math.random() * advice.length)];
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.type === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.type === 'user' ? styles.userText : styles.aiText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.timestamp,
          item.type === 'user' ? styles.userTimestamp : styles.aiTimestamp
        ]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.aiMessage]}>
        <View style={[styles.messageBubble, styles.aiBubble]}>
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={[styles.messageText, styles.aiText, styles.typingText]}>
              AI is thinking...
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AI Stylist</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => Alert.alert(
            'AI Stylist',
            'I can help you with:\n• Outfit suggestions from your closet\n• Weather-appropriate clothing advice\n• Occasion-based styling tips\n• General fashion advice\n\nJust ask me anything!'
          )}
        >
          <Ionicons name="information-circle-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
        />
        {renderTypingIndicator()}
      </KeyboardAvoidingView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me about outfits, styling advice, or fashion tips..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={inputText.trim() ? "#fff" : "#ccc"} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  infoButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#fff',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#666',
    textAlign: 'left',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
});
