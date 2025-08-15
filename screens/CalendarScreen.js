import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen({ navigation }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [outfits, setOutfits] = useState([]);
  const [clothingItems, setClothingItems] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [outfitModalVisible, setOutfitModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [outfitsData, itemsData, eventsData] = await Promise.all([
        AsyncStorage.getItem('outfits'),
        AsyncStorage.getItem('clothingItems'),
        AsyncStorage.getItem('calendarEvents'),
      ]);

      if (outfitsData) {
        setOutfits(JSON.parse(outfitsData));
      }
      if (itemsData) {
        setClothingItems(JSON.parse(itemsData));
      }
      if (eventsData) {
        setCalendarEvents(JSON.parse(eventsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventForDate = (date) => {
    const dateKey = getDateKey(date);
    return calendarEvents.find(event => event.date === dateKey);
  };

  const getOutfitForEvent = (event) => {
    if (!event || !event.outfitId) return null;
    return outfits.find(outfit => outfit.id === event.outfitId);
  };

  const getOutfitItems = (outfit) => {
    if (!outfit) return [];
    return outfit.clothingItemIds.map(id => 
      clothingItems.find(item => item.id === id)
    ).filter(Boolean);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const selectDate = (date) => {
    if (date) {
      setSelectedDate(date);
      setOutfitModalVisible(true);
    }
  };

  const assignOutfit = async (outfit) => {
    if (!selectedDate || !outfit) return;

    try {
      const dateKey = getDateKey(selectedDate);
      const newEvent = {
        id: `event_${Date.now()}`,
        date: dateKey,
        outfitId: outfit.id,
        createdAt: new Date().toISOString(),
      };

      // Check if there's already an event for this date
      const existingEventIndex = calendarEvents.findIndex(event => event.date === dateKey);
      let updatedEvents;

      if (existingEventIndex >= 0) {
        // Update existing event
        updatedEvents = [...calendarEvents];
        updatedEvents[existingEventIndex] = newEvent;
      } else {
        // Add new event
        updatedEvents = [...calendarEvents, newEvent];
      }

      await AsyncStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
      setCalendarEvents(updatedEvents);
      setOutfitModalVisible(false);
      setSelectedDate(null);

      Alert.alert('Success!', `Assigned "${outfit.name}" to ${selectedDate.toLocaleDateString()}`);
    } catch (error) {
      console.error('Error assigning outfit:', error);
      Alert.alert('Error', 'Failed to assign outfit to date.');
    }
  };

  const removeEvent = async (date) => {
    const dateKey = getDateKey(date);
    const eventIndex = calendarEvents.findIndex(event => event.date === dateKey);
    
    if (eventIndex >= 0) {
      Alert.alert(
        'Remove Outfit',
        'Are you sure you want to remove the outfit from this date?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                const updatedEvents = calendarEvents.filter((_, index) => index !== eventIndex);
                await AsyncStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
                setCalendarEvents(updatedEvents);
              } catch (error) {
                console.error('Error removing event:', error);
                Alert.alert('Error', 'Failed to remove outfit from date.');
              }
            },
          },
        ]
      );
    }
  };

  const renderCalendarDay = (day, index) => {
    if (!day) {
      return <View key={index} style={styles.emptyDay} />;
    }

    const event = getEventForDate(day);
            const outfit = getOutfitForEvent(event);
    const isToday = getDateKey(day) === getDateKey(new Date());
    const isSelected = selectedDate && getDateKey(day) === getDateKey(selectedDate);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          isToday && styles.today,
          isSelected && styles.selectedDay,
        ]}
        onPress={() => selectDate(day)}
        onLongPress={() => event && removeEvent(day)}
      >
        <Text style={[
          styles.dayNumber,
          isToday && styles.todayText,
          isSelected && styles.selectedDayText,
        ]}>
          {day.getDate()}
        </Text>
        
        {event && outfit && (
          <View style={styles.eventIndicator}>
            <Text style={styles.eventText} numberOfLines={1}>
              {outfit.name}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderOutfitOption = ({ item }) => (
    <TouchableOpacity
      style={styles.outfitOption}
      onPress={() => assignOutfit(item)}
    >
      <View style={styles.outfitOptionPreview}>
        {getOutfitItems(item).slice(0, 3).map((clothingItem, index) => (
          <Image
            key={clothingItem.id}
            source={{ uri: clothingItem.imageUri }}
            style={[
              styles.outfitOptionImage,
              { zIndex: 3 - index }
            ]}
          />
        ))}
        {getOutfitItems(item).length > 3 && (
          <View style={styles.moreItemsOverlay}>
            <Text style={styles.moreItemsText}>+{getOutfitItems(item).length - 3}</Text>
          </View>
        )}
      </View>
      <View style={styles.outfitOptionInfo}>
        <Text style={styles.outfitOptionName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.outfitOptionCount}>
          {getOutfitItems(item).length} items
        </Text>
      </View>
    </TouchableOpacity>
  );

  const days = getDaysInMonth(currentDate);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Create')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#2196F3" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>{getMonthName(currentDate)}</Text>
        
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={styles.dayHeaders}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <View key={index} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {days.map((day, index) => renderCalendarDay(day, index))}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          💡 Tap a date to assign an outfit • Long press to remove
        </Text>
      </View>

      {/* Outfit Selection Modal */}
      <Modal
        visible={outfitModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOutfitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Assign Outfit to {selectedDate?.toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setOutfitModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {outfits.length > 0 ? (
              <FlatList
                data={outfits}
                renderItem={renderOutfitOption}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.outfitsList}
              />
            ) : (
              <View style={styles.noOutfitsState}>
                <Ionicons name="shirt-outline" size={48} color="#ccc" />
                <Text style={styles.noOutfitsText}>No outfits yet</Text>
                <Text style={styles.noOutfitsSubtext}>
                  Create an outfit first to assign to dates
                </Text>
                <TouchableOpacity
                  style={styles.createOutfitButton}
                  onPress={() => {
                    setOutfitModalVisible(false);
                    navigation.navigate('Create');
                  }}
                >
                  <Text style={styles.createOutfitButtonText}>Create Outfit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 8,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  dayHeaders: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayHeader: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
    padding: 4,
    justifyContent: 'space-between',
  },
  today: {
    backgroundColor: '#e3f2fd',
  },
  selectedDay: {
    backgroundColor: '#2196F3',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  todayText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  eventIndicator: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  eventText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructions: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  instructionsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  outfitsList: {
    padding: 20,
  },
  outfitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  outfitOptionPreview: {
    position: 'relative',
    marginRight: 12,
  },
  outfitOptionImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreItemsOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  moreItemsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  outfitOptionInfo: {
    flex: 1,
  },
  outfitOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  outfitOptionCount: {
    fontSize: 14,
    color: '#666',
  },
  noOutfitsState: {
    alignItems: 'center',
    padding: 40,
  },
  noOutfitsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noOutfitsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  createOutfitButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createOutfitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
