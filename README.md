# CloseApp - AI-Powered Outfit Planner

A cross-platform mobile app built with React Native and Expo that helps users organize their wardrobe, create outfits, and get AI-powered styling suggestions.

## 🎯 Features

### 1. **Upload Outfit & AI Segmentation**
- Take photos or select images from gallery
- AI-powered clothing item detection and segmentation
- Automatic categorization of clothing types (tops, bottoms, dresses, etc.)
- Confidence scoring for detected items
- Save segmented items to personal closet

### 2. **My Closet Management**
- Grid view of all saved clothing items
- Filter by clothing type (tops, bottoms, dresses, outwear, skirts)
- Edit tags and labels for each item
- Delete unwanted items
- View confidence scores from AI detection

### 3. **Outfit Builder**
- Drag-and-drop style clothing selection
- Create custom outfit combinations
- Name and save outfits to library
- Preview selected items before saving

### 4. **Outfit Library**
- Browse all saved outfits
- View outfit details and individual clothing pieces
- Edit existing outfits
- Delete unwanted outfits

### 5. **Calendar Planner**
- Monthly calendar view
- Assign outfits to specific dates
- Long-press to remove outfit assignments
- Visual indicators for planned outfits

### 6. **AI Stylist Chat**
- Interactive chat interface for styling advice
- Outfit suggestions based on your closet
- Weather and occasion-based recommendations
- General fashion tips and advice

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CloseAppExpo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 🔧 Configuration

### API Setup
The app is configured to work with a FastAPI backend for image segmentation. Update the API URL in `screens/UploadOutfitScreen.js`:

```javascript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8000';
```

**Note**: Replace `YOUR_IP_ADDRESS` with your computer's local IP address when testing on physical devices.

### Backend Requirements
The FastAPI server should provide these endpoints:
- `GET /health` - Health check
- `POST /detect_base64` - Image segmentation endpoint

## 📱 App Structure

```
CloseAppExpo/
├── App.js                 # Main navigation setup
├── screens/              # All app screens
│   ├── UploadOutfitScreen.js    # Image upload & segmentation
│   ├── MyClosetScreen.js        # Clothing item management
│   ├── CreateOutfitScreen.js    # Outfit builder
│   ├── OutfitLibraryScreen.js   # Saved outfits library
│   ├── CalendarScreen.js        # Calendar planning
│   └── AIStylistScreen.js       # AI chat interface
├── assets/               # Images and static assets
└── package.json          # Dependencies and scripts
```

## 🎨 Data Models

### ClothingItem
```javascript
{
  id: string,
  imageUri: string,
  type: 'top' | 'bottom' | 'dress' | 'outwear' | 'skirt' | 'shoes',
  tags: string[],
  confidence: number,
  originalImageUri: string,
  createdAt: string
}
```

### Outfit
```javascript
{
  id: string,
  name: string,
  clothingItemIds: string[],
  createdAt: string
}
```

### CalendarEvent
```javascript
{
  id: string,
  date: string, // ISO date
  outfitId: string,
  createdAt: string
}
```

## 💾 Storage

The app uses AsyncStorage for local data persistence:
- `clothingItems` - All detected and saved clothing items
- `outfits` - User-created outfit combinations
- `calendarEvents` - Calendar outfit assignments

## 🔌 API Integration Points

### Image Segmentation
- **Current**: Placeholder integration with FastAPI backend
- **Future**: Can be easily swapped for any image segmentation service

### AI Suggestions
- **Current**: Mock responses based on local data
- **Future**: Can be connected to OpenAI, Claude, or custom AI backend

## 🎯 Usage Guide

### 1. **Getting Started**
1. Open the app and navigate to "Upload" tab
2. Take a photo or select an image from your gallery
3. Process the image to detect clothing items
4. Review and save detected items to your closet

### 2. **Building Outfits**
1. Go to "Create" tab
2. Enter a name for your outfit
3. Select clothing items from your closet
4. Save the outfit to your library

### 3. **Planning Your Week**
1. Navigate to "Calendar" tab
2. Tap on any date to assign an outfit
3. Choose from your saved outfits
4. Long-press to remove assignments

### 4. **Getting Style Advice**
1. Open "AI" tab
2. Ask questions about styling, weather, or occasions
3. Get personalized suggestions based on your closet

## 🛠️ Development

### Adding New Features
- Create new screens in the `screens/` directory
- Add navigation routes in `App.js`
- Update tab icons and labels as needed

### Styling
- Uses React Native StyleSheet for consistent styling
- Color scheme: Blue (#2196F3), Green (#4CAF50), Orange (#FF9800)
- Responsive design with proper spacing and typography

### State Management
- Local state with React hooks
- AsyncStorage for persistence
- No external state management libraries required

## 📱 Platform Support

- ✅ iOS (via Expo Go or build)
- ✅ Android (via Expo Go or build)
- ✅ Web (limited functionality)

## 🔮 Future Enhancements

- User authentication and cloud sync
- Social sharing of outfits
- Weather API integration
- Advanced AI styling recommendations
- Outfit rating and feedback system
- Seasonal wardrobe organization
- Shopping recommendations

## 🐛 Troubleshooting

### Common Issues

1. **Images not loading**
   - Check device permissions for camera and photo library
   - Ensure images are in supported formats (JPEG, PNG)

2. **API connection issues**
   - Verify FastAPI server is running
   - Check IP address configuration
   - Ensure devices are on same network

3. **App crashes**
   - Clear app cache and restart
   - Check for sufficient device storage
   - Update Expo Go app to latest version

### Debug Mode
Enable debug logging by checking the console output in Expo DevTools or your development environment.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues:
- Check the troubleshooting section
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ using React Native & Expo**
