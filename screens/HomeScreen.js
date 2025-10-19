import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Button } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../config/theme';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [clothes, setClothes] = useState([]);

  // Hae vaatteet tietokannasta
  const fetchClothes = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM clothing');
      setClothes(result);
    } catch (error) {
      console.error('Error fetching clothes:', error);
    }
  };

  useEffect(() => {
    fetchClothes();
    const unsubscribe = navigation.addListener('focus', fetchClothes);
    return () => unsubscribe();
  }, [navigation]);

  const renderGridItem = ({ item }) => (
    <View style={theme.gridItem}>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={theme.gridImage} />
      ) : (
        <View style={theme.gridPlaceholder}>
          <Text style={{ color: theme.colors.placeholder }}>No image</Text>
        </View>
      )}
      <Text style={theme.gridText}>{item.name}</Text>
      <Text style={theme.gridText}>{item.category.toUpperCase()}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: theme.spacing.large, backgroundColor: theme.colors.background }}>
      {/* Vaatelista */}
      {clothes.length > 0 ? (
        <FlatList
          data={clothes}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={renderGridItem}
          contentContainerStyle={{ paddingTop: theme.spacing.medium }}
        />
      ) : (
        <Text style={{ textAlign: 'center', marginTop: theme.spacing.large, color: theme.colors.textSecondary }}>
          No clothing items found.
        </Text>
      )}
    </View>
  );
}



