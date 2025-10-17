import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../config/theme';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [suggestedOutfit, setSuggestedOutfit] = useState({});
  const LATITUDE = 60.1699;
  const LONGITUDE = 24.9384;

  // Hae sää Open-Meteosta
  const fetchWeather = async () => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true`
      );
      const data = await response.json();
      return data.current_weather.temperature;
    } catch (error) {
      console.error('Weather fetch error:', error);
      return null;
    }
  };

  // Luo satunnainen ehdotus kategorioittain
  const generateSuggestedOutfit = (clothes, temperature) => {
    const categories = ['top', 'bottom', 'shoes', 'hat'];
    const outfit = {};

    categories.forEach(category => {
      let items = clothes.filter(item => item.category === category);
      if (temperature !== null) {
        items = items.filter(item => {
          if (category === 'top' && temperature < 10) return item.warm;
          return true;
        });
      }
      if (items.length > 0) {
        outfit[category] = items[Math.floor(Math.random() * items.length)];
      }
    });

    setSuggestedOutfit(outfit);
  };

  // Hae vaatteet ja generoi ehdotus
  const fetchClothes = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM clothing');
      const temp = await fetchWeather();
      generateSuggestedOutfit(result, temp);
    } catch (error) {
      console.error('Error fetching clothes:', error);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, []);

  const renderGridItem = ({ item: [category, item] }) => (
    <View style={theme.gridItem}>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={theme.gridImage} />
      ) : (
        <View style={theme.gridPlaceholder}>
          <Text style={{ color: theme.colors.placeholder }}>No image</Text>
        </View>
      )}
      <Text style={theme.gridText}>{category.toUpperCase()}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: theme.spacing.large, backgroundColor: theme.colors.background }}>
      {/* Navigointinapit */}
      <Button
        title="View Full Clothing List"
        onPress={() => navigation.navigate('ClothingList')}
      />
      <Button
        title="Add New Clothing"
        onPress={() => navigation.navigate('AddClothing')}
      />

      {/* Päivän ehdotus */}
      {Object.keys(suggestedOutfit).length > 0 ? (
        <FlatList
          data={Object.entries(suggestedOutfit)}
          keyExtractor={([category]) => category}
          numColumns={2}
          renderItem={renderGridItem}
          contentContainerStyle={{ paddingTop: theme.spacing.medium }}
        />
      ) : (
        <Text style={{ textAlign: 'center', marginTop: theme.spacing.large, color: theme.colors.textSecondary }}>
          Loading outfit...
        </Text>
      )}
    </View>
  );
}