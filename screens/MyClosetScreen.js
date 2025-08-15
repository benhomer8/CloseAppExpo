import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function MyClosetScreen({ navigation }) {
  const [clothingItems, setClothingItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTags, setEditTags] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadClothingItems();
  }, []);

  const loadClothingItems = async () => {
    try {
      const items = await AsyncStorage.getItem('clothingItems');
      if (items) {
        setClothingItems(JSON.parse(items));
      }
    } catch (error) {
      console.error('Error loading clothing items:', error);
    }
  };

  const deleteItem = async (itemId) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this clothing item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedItems = clothingItems.filter(item => item.id !== itemId);
              await AsyncStorage.setItem('clothingItems', JSON.stringify(updatedItems));
              setClothingItems(updatedItems);
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTags(item.tags.join(', '));
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    try {
      const updatedItems = clothingItems.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          };
        }
        return item;
      });

      await AsyncStorage.setItem('clothingItems', JSON.stringify(updatedItems));
      setClothingItems(updatedItems);
      setEditModalVisible(false);
      setEditingItem(null);
      setEditTags('');
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  const getFilteredItems = () => {
    if (filterType === 'all') return clothingItems;
    return clothingItems.filter(item => item.type === filterType);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'top': return 'shirt-outline';
      case 'bottom': return 'pants-outline';
      case 'dress': return 'female-outline';
      case 'outwear': return 'jacket-outline';
      case 'skirt': return 'skirt-outline';
      case 'shoes': return 'football-outline';
      default: return 'shirt-outline';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'top': return '#2196F3';
      case 'bottom': return '#4CAF50';
      case 'dress': return '#9C27B0';
      case 'outwear': return '#FF9800';
      case 'skirt': return '#E91E63';
      case 'shoes': return '#795548';
      default: return '#9E9E9E';
    }
  };

  const renderClothingItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
            <Ionicons name={getTypeIcon(item.type)} size={16} color="#fff" />
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
              <Ionicons name="create-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        {item.confidence && (
          <Text style={styles.confidenceText}>
            Confidence: {(item.confidence * 100).toFixed(1)}%
          </Text>
        )}
      </View>
    </View>
  );

  const renderFilterButton = (type, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterType === type && styles.filterButtonActive
      ]}
      onPress={() => setFilterType(type)}
    >
      <Text style={[
        styles.filterButtonText,
        filterType === type && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Closet</Text>
        <Text style={styles.itemCount}>{clothingItems.length} items</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('top', 'Tops')}
        {renderFilterButton('bottom', 'Bottoms')}
        {renderFilterButton('dress', 'Dresses')}
        {renderFilterButton('outwear', 'Outwear')}
        {renderFilterButton('skirt', 'Skirts')}
      </View>

      {/* Clothing Items Grid */}
      {getFilteredItems().length > 0 ? (
        <FlatList
          data={getFilteredItems()}
          renderItem={renderClothingItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.itemsGrid}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="shirt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>
            {filterType === 'all' 
              ? 'No clothing items yet' 
              : `No ${filterType} items yet`
            }
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Upload an outfit to get started!
          </Text>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => navigation.navigate('Upload')}
          >
            <Text style={styles.uploadButtonText}>Upload Outfit</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Tags</Text>
            <Text style={styles.modalSubtitle}>
              Separate tags with commas
            </Text>
            <TextInput
              style={styles.tagInput}
              value={editTags}
              onChangeText={setEditTags}
              placeholder="e.g., casual, summer, cotton"
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEdit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
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
  itemCount: {
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  itemsGrid: {
    padding: 10,
  },
  itemCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  itemInfo: {
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  itemActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
  },
  confidenceText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  tagInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
