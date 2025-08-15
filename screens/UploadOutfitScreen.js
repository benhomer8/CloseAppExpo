import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// API configuration - update this to match your FastAPI server
const API_BASE_URL = 'http://192.168.1.18:8000'; // Update with your computer's IP address

// Class names mapping based on your fashion model
const CLASS_NAMES = {
  0: 'Background',
  1: 'Long Sleeve Dress',
  2: 'Long Sleeve Outwear',
  3: 'Long Sleeve Top',
  4: 'Short Sleeve Dress',
  5: 'Short Sleeve Outwear',
  6: 'Short Sleeve Top',
  7: 'Shorts',
  8: 'Skirt',
  9: 'Sling',
  10: 'Sling Dress',
  11: 'Trousers',
  12: 'Vest',
  13: 'Vest Dress',
};

export default function UploadOutfitScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectedItems, setDetectedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown');
  const [imageDimensions, setImageDimensions] = useState({ width: 300, height: 225 });

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setApiStatus('healthy');
      } else {
        setApiStatus('unhealthy');
      }
    } catch (error) {
      setApiStatus('error');
      console.log('API health check failed:', error);
    }
  };

  // Request permissions for camera and photo library
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert('Permission Required', 'Camera and photo library permissions are required.');
    }
  };

  // Pick image from camera
  const takePhoto = async () => {
    await requestPermissions();
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedImage(asset);
      setDetectedItems([]);
      
      // Get image dimensions and store them in the asset
      Image.getSize(asset.uri, (width, height) => {
        const assetWithDimensions = { ...asset, width, height };
        setSelectedImage(assetWithDimensions);
        setImageDimensions({ width, height });
        console.log(`Image dimensions set: ${width}x${height}`);
      });
    }
  };

  // Pick image from photo library
  const pickImage = async () => {
    await requestPermissions();
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedImage(asset);
      setDetectedItems([]);
      
      // Get image dimensions and store them in the asset
      Image.getSize(asset.uri, (width, height) => {
        const assetWithDimensions = { ...asset, width, height };
        setSelectedImage(assetWithDimensions);
        setImageDimensions({ width, height });
        console.log(`Image dimensions set: ${width}x${height}`);
      });
    }
  };

  // Process image with Mask R-CNN API
  const processImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setIsProcessing(true);
    setDetectedItems([]);

    try {
      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(selectedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to API
      const response = await fetch(`${API_BASE_URL}/detect_base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Store the original image dimensions from the backend response
        if (result.image_shape && result.image_shape.length >= 2) {
          const [height, width] = result.image_shape;
          console.log(`Backend image dimensions: ${width}x${height}`);
          
          // Update the selected image with the actual dimensions from backend
          setSelectedImage(prev => ({
            ...prev,
            width: width,
            height: height
          }));
        }
        
        // Convert API results to our detected items format
        if (result.masks && result.masks.length > 0) {
          console.log(`Found ${result.masks.length} masks`);
          const items = result.masks.map((mask, index) => {
            // Try different possible image URI formats
            let imageUri = selectedImage.uri; // fallback to original image
            
            if (mask.masked_image) {
              // If it's base64 data
              if (typeof mask.masked_image === 'string' && mask.masked_image.length > 100) {
                imageUri = `data:image/png;base64,${mask.masked_image}`;
              }
            }
            
            return {
              id: `item_${index}`,
              imageUri: imageUri,
              type: getClothingType(mask.class_id),
              label: mask.class_name || CLASS_NAMES[mask.class_id] || `Class ${mask.class_id}`,
              confidence: mask.confidence || 0.8,
              originalMask: mask, // Keep original data for saving
            };
          });
          
          setDetectedItems(items);
        } else {
          console.log('No masks found in response');
          // If no masks, show the original image as a single item for testing
          setDetectedItems([{
            id: 'test_item',
            imageUri: selectedImage.uri,
            type: 'Test',
            label: 'Test Item (No masks detected)',
            confidence: 1.0,
          }]);
        }
      } else {
        Alert.alert('Processing Error', result.error || 'Failed to process image');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to categorize clothing type
  const getClothingType = (classId) => {
    if ([1, 4, 10, 13].includes(classId)) return 'Dress';
    if ([2, 5, 12].includes(classId)) return 'Jacket';
    if ([3, 6].includes(classId)) return 'Top';
    if ([7, 11].includes(classId)) return 'Pants';
    if ([8, 9].includes(classId)) return 'Skirt';
    return 'Other';
  };

  // Remove detected item
  const removeItem = (itemId) => {
    setDetectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Start editing an item
  const startEditing = (item) => {
    setEditingItem({ ...item });
  };

  // Save edited item
  const saveEdit = () => {
    if (!editingItem || !editingItem.label.trim()) {
      Alert.alert('Error', 'Please enter a valid label.');
      return;
    }

    setDetectedItems(prev => 
      prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, type: editingItem.type, label: editingItem.label.trim() }
          : item
      )
    );
    setEditingItem(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
  };

  // Save all items to closet
  const saveToCloset = async () => {
    if (detectedItems.length === 0) {
      Alert.alert('No Items', 'No items to save.');
      return;
    }

    try {
      const clothingItems = detectedItems.map(item => ({
        id: `item_${Date.now()}_${item.id}`,
        imageUri: item.imageUri,
        type: item.type.toLowerCase(),
        tags: [item.label],
        confidence: item.confidence,
        originalImageUri: selectedImage.uri,
        createdAt: new Date().toISOString(),
      }));

      // Get existing items
      const existingItems = await AsyncStorage.getItem('clothingItems');
      const allItems = existingItems ? JSON.parse(existingItems) : [];
      
      // Add new items
      const updatedItems = [...allItems, ...clothingItems];
      await AsyncStorage.setItem('clothingItems', JSON.stringify(updatedItems));

      Alert.alert(
        'Success!', 
        `Saved ${clothingItems.length} clothing items to your closet.`,
        [
          { text: 'View Closet', onPress: () => navigation.navigate('Closet') },
          { text: 'OK' }
        ]
      );

      // Reset the screen
      setSelectedImage(null);
      setDetectedItems([]);
    } catch (error) {
      console.error('Error saving clothing items:', error);
      Alert.alert('Error', 'Failed to save clothing items.');
    }
  };

  const getApiStatusColor = () => {
    switch (apiStatus) {
      case 'healthy': return '#4CAF50';
      case 'unhealthy': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'healthy': return 'API Connected';
      case 'unhealthy': return 'API Issues';
      case 'error': return 'API Offline';
      default: return 'Checking...';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Upload Outfit</Text>
      </View>

      {/* Image Selection */}
      {!selectedImage ? (
        <View style={styles.uploadSection}>
          <View style={styles.uploadIcon}>
            <Text style={styles.uploadIconText}>📷</Text>
          </View>
          <Text style={styles.uploadTitle}>Select an outfit photo</Text>
          <Text style={styles.uploadSubtitle}>
            Take a photo or choose from your gallery
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.buttonText}>📷 Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>🖼️ Choose Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.imageSection}>
          {/* Selected Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: selectedImage.uri }} 
              style={styles.selectedImage}
              resizeMode="cover"
            />
            
            <TouchableOpacity 
              style={styles.changeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>

          {/* Process Button */}
          {detectedItems.length === 0 && (
            <TouchableOpacity 
              style={[styles.processButton, isProcessing && styles.processButtonDisabled]} 
              onPress={processImage}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.processingText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.processButtonText}>🔍 Detect Clothing Items</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Detected Items List */}
          {detectedItems.length > 0 && (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Detected Items</Text>
                <Text style={styles.resultsSubtitle}>
                  {detectedItems.length} items found
                </Text>
              </View>
              
              <ScrollView 
                style={styles.itemsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.itemsListContent}
              >
                {detectedItems.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    {/* Item Image */}
                    <Image
                      source={{ uri: item.imageUri }}
                      style={styles.itemImage}
                      resizeMode="cover"
                      onError={(error) => console.log('Image load error for item:', item.id, error)}
                      onLoad={() => console.log('Image loaded successfully for item:', item.id)}
                    />
                    
                    {/* Item Details */}
                    <View style={styles.itemDetails}>
                      {editingItem && editingItem.id === item.id ? (
                        // Edit Mode
                        <View style={styles.editMode}>
                          <TextInput
                            style={styles.editInput}
                            value={editingItem.label}
                            onChangeText={(text) => setEditingItem(prev => ({ ...prev, label: text }))}
                            placeholder="Enter item name"
                            autoFocus
                          />
                          
                          <View style={styles.typeSelector}>
                            {['Top', 'Dress', 'Pants', 'Skirt', 'Jacket', 'Shoes', 'Accessory'].map((type) => (
                              <TouchableOpacity
                                key={type}
                                style={[
                                  styles.typeOption,
                                  editingItem.type === type && styles.typeOptionSelected
                                ]}
                                onPress={() => setEditingItem(prev => ({ ...prev, type }))}
                              >
                                <Text style={[
                                  styles.typeOptionText,
                                  editingItem.type === type && styles.typeOptionTextSelected
                                ]}>
                                  {type}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          
                          <View style={styles.editActions}>
                            <TouchableOpacity style={styles.saveEditButton} onPress={saveEdit}>
                              <Text style={styles.saveEditButtonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelEditButton} onPress={cancelEdit}>
                              <Text style={styles.cancelEditButtonText}>Cancel</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        // Display Mode
                        <View style={styles.displayMode}>
                          <Text style={styles.itemLabel}>{item.label}</Text>
                          <Text style={styles.itemType}>{item.type}</Text>
                          <Text style={styles.itemConfidence}>
                            {(item.confidence * 100).toFixed(0)}% confidence
                          </Text>
                          
                          <View style={styles.itemActions}>
                            <TouchableOpacity 
                              style={styles.editButton}
                              onPress={() => startEditing(item)}
                            >
                              <Text style={styles.editButtonText}>✏️ Edit</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={styles.removeButton}
                              onPress={() => removeItem(item.id)}
                            >
                              <Text style={styles.removeButtonText}>🗑️ Remove</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
              
              {/* Save Button */}
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={saveToCloset}
              >
                <Text style={styles.saveButtonText}>💾 Save {detectedItems.length} Items to Closet</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Debug Info */}
          {detectedItems.length === 0 && !isProcessing && selectedImage && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>Debug: No items detected yet</Text>
              <Text style={styles.debugText}>Items array length: {detectedItems.length}</Text>
              <Text style={styles.debugText}>Processing state: {isProcessing.toString()}</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
  },
  apiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
  },
  configInfo: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  configText: {
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 3,
    fontWeight: '500',
  },
  uploadSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  uploadIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadIconText: {
    fontSize: 48,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    minWidth: 140,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  imageSection: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedImage: {
    width: width - 80,
    height: (width - 80) * 0.75,
    borderRadius: 16,
    marginBottom: 16,
  },
  changeImageButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  processButton: {
    backgroundColor: '#28a745',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 20,
  },
  processButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  resultsHeader: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#f8f9fa',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  displayMode: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  itemConfidence: {
    fontSize: 12,
    color: '#adb5bd',
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#17a2b8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  editMode: {
    flex: 1,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  typeOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  typeOptionSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  typeOptionTextSelected: {
    color: '#fff',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveEditButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  saveEditButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelEditButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  cancelEditButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#ff6b35',
    paddingVertical: 18,
    paddingHorizontal: 24,
    margin: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  debugInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    alignItems: 'center',
  },
  debugText: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
});
