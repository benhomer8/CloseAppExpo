import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import UploadOutfitScreen from './screens/UploadOutfitScreen';
import MyClosetScreen from './screens/MyClosetScreen';
import CreateOutfitScreen from './screens/CreateOutfitScreen';
import OutfitLibraryScreen from './screens/OutfitLibraryScreen';
import CalendarScreen from './screens/CalendarScreen';
import AIStylistScreen from './screens/AIStylistScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for Upload Outfit (can have additional screens)
function UploadStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="UploadOutfit" 
        component={UploadOutfitScreen}
        options={{ title: 'Upload Outfit' }}
      />
    </Stack.Navigator>
  );
}

// Stack navigator for Create Outfit
function CreateOutfitStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CreateOutfit" 
        component={CreateOutfitScreen}
        options={{ title: 'Create Outfit' }}
      />
    </Stack.Navigator>
  );
}

// Stack navigator for My Closet
function MyClosetStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MyCloset" 
        component={MyClosetScreen}
        options={{ title: 'My Closet' }}
      />
    </Stack.Navigator>
  );
}

// Stack navigator for Outfit Library
function OutfitLibraryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="OutfitLibrary" 
        component={OutfitLibraryScreen}
        options={{ title: 'Outfit Library' }}
      />
    </Stack.Navigator>
  );
}

// Stack navigator for Calendar
function CalendarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
    </Stack.Navigator>
  );
}

// Stack navigator for AI Stylist
function AIStylistStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AIStylist" 
        component={AIStylistScreen}
        options={{ title: 'AI Stylist' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Upload') {
              iconName = focused ? 'camera' : 'camera-outline';
            } else if (route.name === 'Closet') {
              iconName = focused ? 'shirt' : 'shirt-outline';
            } else if (route.name === 'Create') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Library') {
              iconName = focused ? 'library' : 'library-outline';
            } else if (route.name === 'Calendar') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'AI') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Upload" component={UploadStack} />
        <Tab.Screen name="Closet" component={MyClosetStack} />
        <Tab.Screen name="Create" component={CreateOutfitStack} />
        <Tab.Screen name="Library" component={OutfitLibraryStack} />
        <Tab.Screen name="Calendar" component={CalendarStack} />
        <Tab.Screen name="AI" component={AIStylistStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
