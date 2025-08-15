import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * Clothing Item Data Structure
 * 
 * @typedef {Object} ClothingItem
 * @property {string} id - Unique identifier for the clothing item
 * @property {string} imageUri - URI of the clothing item image (base64 or file path)
 * @property {string} type - Category of clothing (top, bottom, dress, jacket, shoes, accessory)
 * @property {Array<string>} tags - Array of descriptive tags
 * @property {number} confidence - Detection confidence score (0-1)
 * @property {string} originalImageUri - URI of the original outfit image
 * @property {string} createdAt - ISO timestamp when item was created
 * @property {string} [name] - Custom name for the item
 * @property {string} [color] - Primary color of the item
 * @property {string} [season] - Season(s) the item is suitable for (spring, summer, fall, winter)
 * @property {string} [occasion] - Occasion(s) the item is suitable for (casual, formal, work, party, etc.)
 * @property {string} [brand] - Brand name if known
 * @property {string} [material] - Material type (cotton, silk, denim, etc.)
 * @property {boolean} [favorite] - Whether the item is marked as favorite
 * @property {number} [wearCount] - Number of times the item has been worn
 * @property {string} [lastWorn] - ISO timestamp of last time worn
 * @property {Object} [originalMask] - Original AI detection mask data
 */

/**
 * Clothing Component - Displays a single clothing item
 * 
 * @param {Object} props
 * @param {ClothingItem} props.item - The clothing item to display
 * @param {Function} props.onPress - Function called when item is pressed
 * @param {Function} props.onEdit - Function called when edit button is pressed
 * @param {Function} props.onDelete - Function called when delete button is pressed
 * @param {Function} props.onFavorite - Function called when favorite button is pressed
 * @param {boolean} props.showActions - Whether to show action buttons
 * @param {string} props.size - Size of the component ('small', 'medium', 'large')
 * @param {boolean} props.selectable - Whether the item can be selected
 * @param {boolean} props.selected - Whether the item is currently selected
 */
export default function Clothing({
  item,
  onPress,
  onEdit,
  onDelete,
  onFavorite,
  showActions = true,
  size = 'medium',
  selectable = false,
  selected = false,
}) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          image: styles.smallImage,
          text: styles.smallText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          image: styles.largeImage,
          text: styles.largeText,
        };
      default:
        return {
          container: styles.mediumContainer,
          image: styles.mediumImage,
          text: styles.mediumText,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const getTypeColor = (type) => {
    const colors = {
      top: '#FF6B6B',
      bottom: '#4ECDC4',
      dress: '#45B7D1',
      jacket: '#96CEB4',
      shoes: '#FFEAA7',
      accessory: '#DDA0DD',
      other: '#95A5A6',
    };
    return colors[type.toLowerCase()] || colors.other;
  };

  const formatConfidence = (confidence) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const getSeasonIcon = (season) => {
    const icons = {
      spring: 'flower',
      summer: 'sunny',
      fall: 'leaf',
      winter: 'snow',
    };
    return icons[season] || 'calendar';
  };

  return (
    <TouchableOpacity
      style={[
        sizeStyles.container,
        selectable && selected && styles.selected,
        selectable && styles.selectable,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUri }}
          style={sizeStyles.image}
          resizeMode="cover"
        />
        
        {/* Confidence Badge */}
        <View style={[styles.confidenceBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Text style={styles.confidenceText}>{formatConfidence(item.confidence)}</Text>
        </View>

        {/* Favorite Badge */}
        {item.favorite && (
          <View style={styles.favoriteBadge}>
            <Ionicons name="heart" size={12} color="#FF6B6B" />
          </View>
        )}

        {/* Selection Indicator */}
        {selectable && selected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name/Label */}
        <Text style={[styles.name, sizeStyles.text]} numberOfLines={1}>
          {item.name || item.tags[0] || 'Unnamed Item'}
        </Text>

        {/* Type */}
        <View style={styles.typeContainer}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
            <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
          </View>
        </View>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <Text key={index} style={styles.tag} numberOfLines={1}>
                {tag}
              </Text>
            ))}
            {item.tags.length > 2 && (
              <Text style={styles.moreTags}>+{item.tags.length - 2}</Text>
            )}
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          {item.color && (
            <View style={styles.infoItem}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <Text style={styles.infoText}>{item.color}</Text>
            </View>
          )}
          
          {item.season && (
            <View style={styles.infoItem}>
              <Ionicons name={getSeasonIcon(item.season)} size={12} color="#666" />
              <Text style={styles.infoText}>{item.season}</Text>
            </View>
          )}
        </View>

        {/* Wear Count */}
        {item.wearCount > 0 && (
          <View style={styles.wearCount}>
            <Ionicons name="shirt" size={12} color="#666" />
            <Text style={styles.wearCountText}>{item.wearCount}x</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actions}>
          {onFavorite && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onFavorite(item)}
            >
              <Ionicons
                name={item.favorite ? "heart" : "heart-outline"}
                size={16}
                color={item.favorite ? "#FF6B6B" : "#666"}
              />
            </TouchableOpacity>
          )}
          
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(item)}
            >
              <Ionicons name="pencil" size={16} color="#666" />
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(item)}
            >
              <Ionicons name="trash" size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Small size
  smallContainer: {
    width: 80,
    marginBottom: 8,
  },
  smallImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  smallText: {
    fontSize: 10,
  },

  // Medium size
  mediumContainer: {
    width: 120,
    marginBottom: 12,
  },
  mediumImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  mediumText: {
    fontSize: 12,
  },

  // Large size
  largeContainer: {
    width: 160,
    marginBottom: 16,
  },
  largeImage: {
    width: 160,
    height: 160,
    borderRadius: 16,
  },
  largeText: {
    fontSize: 14,
  },

  // Common styles
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  confidenceBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  selectable: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  typeContainer: {
    marginBottom: 4,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  tag: {
    fontSize: 10,
    color: '#666',
    marginRight: 4,
  },
  moreTags: {
    fontSize: 10,
    color: '#999',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  infoText: {
    fontSize: 10,
    color: '#666',
  },
  wearCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wearCountText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    padding: 4,
  },
});

/**
 * Helper function to create a new clothing item
 * 
 * @param {Object} data - Clothing item data
 * @returns {ClothingItem} - New clothing item object
 */
export const createClothingItem = (data) => {
  return {
    id: data.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    imageUri: data.imageUri,
    type: data.type || 'other',
    tags: data.tags || [],
    confidence: data.confidence || 0.8,
    originalImageUri: data.originalImageUri,
    createdAt: data.createdAt || new Date().toISOString(),
    name: data.name || null,
    color: data.color || null,
    season: data.season || null,
    occasion: data.occasion || null,
    brand: data.brand || null,
    material: data.material || null,
    favorite: data.favorite || false,
    wearCount: data.wearCount || 0,
    lastWorn: data.lastWorn || null,
    originalMask: data.originalMask || null,
  };
};

/**
 * Helper function to validate clothing item data
 * 
 * @param {Object} data - Clothing item data to validate
 * @returns {boolean} - Whether the data is valid
 */
export const validateClothingItem = (data) => {
  const required = ['imageUri', 'type'];
  return required.every(field => data[field] !== undefined && data[field] !== null);
};

/**
 * Helper function to get clothing type from class ID
 * 
 * @param {number} classId - AI model class ID
 * @returns {string} - Clothing type
 */
export const getClothingTypeFromClassId = (classId) => {
  const typeMap = {
    1: 'dress', 4: 'dress', 10: 'dress', 13: 'dress',
    2: 'jacket', 5: 'jacket', 12: 'jacket',
    3: 'top', 6: 'top',
    7: 'bottom', 11: 'bottom',
    8: 'bottom', 9: 'bottom',
  };
  return typeMap[classId] || 'other';
};
