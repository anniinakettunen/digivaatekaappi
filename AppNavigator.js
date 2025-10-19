import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import HomeScreen from './screens/HomeScreen';
import SavedStylesScreen from './screens/SavedStylesScreen';
import ClothingList from './screens/ClothingList';
import AddClothingScreen from './screens/AddClothingScreen';
import EditOutFitScreen from './screens/EditOutFitScreen'; 
import FashionNewsScreen from './screens/FashionNewsScreen';
import { Handbag } from 'lucide-react-native';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#4a90e2',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Octicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Outfits" 
        component={SavedStylesScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="shoe-heel" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Add Clothing" 
        component={AddClothingScreen} 
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ color, size }) => <Octicons name="plus" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Closet" 
        component={ClothingList} 
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome6 name="shirt" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Trends"
        component={FashionNewsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Handbag color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditOutFit"
        component={EditOutFitScreen}
        options={{ title: 'Edit Outfit' }}
      />
    </Stack.Navigator>
  );
}
