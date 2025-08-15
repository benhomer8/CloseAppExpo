import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CreateOutfitScreen({ navigation }) {
  const [clothingItems, setClothingItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [outfitName, setOutfitName] = useState('');
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

  const toggleItemSelection = (item) => {
    if (selectedItems.find(selected => selected.id === item.id)) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeItemFromOutfit = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const saveOutfit = async () => {
    if (!outfitName.trim()) {
      Alert.alert('Outfit Name Required', 'Please enter a name for your outfit.');
      return;
    }

    if (selectedItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one clothing item for your outfit.');
      return;
    }

    try {
      const newOutfit = {
        id: `outfit_${Date.now()}`,
        name: outfitName.trim(),
        clothingItemIds: selectedItems.map(item => item.id),
        createdAt: new Date().toISOString(),
      };

      // Get existing outfits
      const existingOutfits = await AsyncStorage.getItem('outfits');
      const allOutfits = existingOutfits ? JSON.parse(existingOutfits) : [];
      
      // Add new outfit
      const updatedOutfits = [...allOutfits, newOutfit];
      await AsyncStorage.setItem('outfits', JSON.stringify(updatedOutfits));

      Alert.alert(
        'Success!', 
        'Outfit saved to your library.',
        [
          { text: 'View Library', onPress: () => navigation.navigate('Library') },
          { text: 'Create Another', onPress: () => resetForm() }
        ]
      );
    } catch (error) {
      console.error('Error saving outfit:', error);
      Alert.alert('Error', 'Failed to save outfit.');
    }
  };

  const resetForm = () => {
    setOutfitName('');
    setSelectedItems([]);
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

  const renderClothingItem = (item) => {
    const isSelected = selectedItems.find(selected => selected.id === item.id);
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.clothingItem,
          isSelected && styles.clothingItemSelected
        ]}
        onPress={() => toggleItemSelection(item)}
      >
        <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
        <View style={styles.itemOverlay}>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          )}
        </View>
        <View style={styles.itemInfo}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
            <Ionicons name={getTypeIcon(item.type)} size={12} color="#fff" />
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedItem = (item) => (
    <View key={item.id} style={styles.selectedItemCard}>
      <Image source={{ uri: item.imageUri }} style={styles.selectedItemImage} />
      <View style={styles.selectedItemInfo}>
        <Text style={styles.selectedItemType}>{item.type}</Text>
        <Text style={styles.selectedItemTags} numberOfLines={2}>
          {item.tags.join(', ')}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItemFromOutfit(item.id)}
      >
        <Ionicons name="close-circle" size={24} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Outfit</Text>
        <TouchableOpacity onPress={resetForm} style={styles.resetButton}>
          <Ionicons name="refresh-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Outfit Name Input */}
      <View style={styles.nameInputContainer}>
        <Text style={styles.nameInputLabel}>Outfit Name</Text>
        <TextInput
          style={styles.nameInput}
          value={outfitName}
          onChangeText={setOutfitName}
          placeholder="e.g., Casual Friday, Summer Party, Work Outfit"
          placeholderTextColor="#999"
        />
      </View>

      {/* Selected Items Preview */}
      {selectedItems.length > 0 && (
        <View style={styles.selectedItemsContainer}>
          <Text style={styles.selectedItemsTitle}>
            Selected Items ({selectedItems.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedItems.map(renderSelectedItem)}
          </ScrollView>
        </View>
      )}

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
        <ScrollView style={styles.itemsContainer}>
          <View style={styles.itemsGrid}>
            {getFilteredItems().map(renderClothingItem)}
          </View>
        </ScrollView>
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

      {/* Save Button */}
      {selectedItems.length > 0 && (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !outfitName.trim() && styles.saveButtonDisabled
            ]}
            onPress={saveOutfit}
            disabled={!outfitName.trim()}
          >
            <Text style={styles.saveButtonText}>
              💾 Save Outfit ({selectedItems.length} items)
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  resetButton: {
    padding: 8,
  },
  nameInputContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  nameInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  selectedItemsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedItemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  selectedItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginRight: 15,
    minWidth: 200,
  },
  selectedItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedItemTags: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    padding: 4,
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
  itemsContainer: {
    flex: 1,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  clothingItem: {
    width: (width - 40) / 3,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    overflow: 'hidden',
    position: 'relative',
  },
  clothingItemSelected: {
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  itemImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  itemOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  selectedIndicator: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  itemInfo: {
    padding: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
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
  saveButtonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
