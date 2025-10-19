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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 🔽 BottomTabs siirretty tänne
export function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#4a90e2',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingBottom: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'HomePage') {
            return <Octicons name="home" size={size} color={color} />;
          } else if (route.name === 'All Clothes') {
            return <FontAwesome6 name="shirt" size={size} color={color} />;
          } else if (route.name === 'Add New') {
            return <Octicons name="plus" size={size} color={color} />;
          } else if (route.name === 'Styles') {
            return <MaterialCommunityIcons name="shoe-heel" size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="HomePage" component={HomeScreen} />
      <Tab.Screen name="Styles" component={SavedStylesScreen} />
      <Tab.Screen name="All Clothes" component={ClothingList} />
      <Tab.Screen name="Add New" component={AddClothingScreen} />
    </Tab.Navigator>
  );
}

// 🧭 Stack-navigaattori joka sisältää tabit + muokkausnäytön
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
