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
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OutfitLibraryScreen({ navigation }) {
  const [outfits, setOutfits] = useState([]);
  const [clothingItems, setClothingItems] = useState([]);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [outfitsData, itemsData] = await Promise.all([
        AsyncStorage.getItem('outfits'),
        AsyncStorage.getItem('clothingItems'),
      ]);

      if (outfitsData) {
        setOutfits(JSON.parse(outfitsData));
      }
      if (itemsData) {
        setClothingItems(JSON.parse(itemsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const deleteOutfit = async (outfitId) => {
    Alert.alert(
      'Delete Outfit',
      'Are you sure you want to delete this outfit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedOutfits = outfits.filter(outfit => outfit.id !== outfitId);
              await AsyncStorage.setItem('outfits', JSON.stringify(updatedOutfits));
              setOutfits(updatedOutfits);
            } catch (error) {
              console.error('Error deleting outfit:', error);
              Alert.alert('Error', 'Failed to delete outfit.');
            }
          },
        },
      ]
    );
  };

  const openOutfitDetail = (outfit) => {
    setSelectedOutfit(outfit);
    setDetailModalVisible(true);
  };

  const getOutfitItems = (outfit) => {
    return outfit.clothingItemIds.map(id => 
      clothingItems.find(item => item.id === id)
    ).filter(Boolean);
  };

  const renderOutfitCard = ({ item }) => {
    const outfitItems = getOutfitItems(item);
    
    return (
      <TouchableOpacity
        style={styles.outfitCard}
        onPress={() => openOutfitDetail(item)}
      >
        <View style={styles.outfitPreview}>
          {outfitItems.slice(0, 4).map((clothingItem, index) => (
            <Image
              key={clothingItem.id}
              source={{ uri: clothingItem.imageUri }}
              style={[
                styles.previewImage,
                { zIndex: outfitItems.length - index }
              ]}
            />
          ))}
          {outfitItems.length > 4 && (
            <View style={styles.moreItemsOverlay}>
              <Text style={styles.moreItemsText}>+{outfitItems.length - 4}</Text>
            </View>
          )}
        </View>
        <View style={styles.outfitInfo}>
          <Text style={styles.outfitName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.outfitItemCount}>
            {outfitItems.length} items
          </Text>
          <Text style={styles.outfitDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteOutfit(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderOutfitDetail = () => {
    if (!selectedOutfit) return null;

    const outfitItems = getOutfitItems(selectedOutfit);

    return (
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedOutfit.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              {outfitItems.length} items • Created {new Date(selectedOutfit.createdAt).toLocaleDateString()}
            </Text>

            <ScrollView style={styles.detailItemsContainer}>
              {outfitItems.map((item) => (
                <View key={item.id} style={styles.detailItem}>
                  <Image source={{ uri: item.imageUri }} style={styles.detailItemImage} />
                  <View style={styles.detailItemInfo}>
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                      <Ionicons name={getTypeIcon(item.type)} size={16} color="#fff" />
                      <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                    <View style={styles.tagsContainer}>
                      {item.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setDetailModalVisible(false);
                  navigation.navigate('Create', { editOutfit: selectedOutfit });
                }}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Edit Outfit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Outfit Library</Text>
        <Text style={styles.outfitCount}>{outfits.length} outfits</Text>
      </View>

      {/* Outfits Grid */}
      {outfits.length > 0 ? (
        <FlatList
          data={outfits}
          renderItem={renderOutfitCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.outfitsGrid}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="library-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No outfits yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create your first outfit to get started!
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('Create')}
          >
            <Text style={styles.createButtonText}>Create Outfit</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Outfit Detail Modal */}
      {renderOutfitDetail()}
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
  outfitCount: {
    fontSize: 16,
    color: '#666',
  },
  outfitsGrid: {
    padding: 10,
  },
  outfitCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    position: 'relative',
  },
  outfitPreview: {
    height: 120,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  previewImage: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreItemsOverlay: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moreItemsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  outfitInfo: {
    padding: 12,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  outfitItemCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  outfitDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
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
  createButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  detailItemsContainer: {
    paddingHorizontal: 20,
    maxHeight: 300,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  detailItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  detailItemInfo: {
    flex: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  editButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
