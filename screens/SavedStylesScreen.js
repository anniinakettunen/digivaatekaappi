import React, { useEffect, useState } from 'react';
import { View, FlatList, Image } from 'react-native';
import { Card, Text, Button, Provider as PaperProvider } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../config/GlobalStyles';
import { theme } from '../config/theme';

export default function SavedStylesScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [outfits, setOutfits] = useState([]);

  useEffect(() => {
    fetchOutfits();
    const unsubscribe = navigation.addListener('focus', fetchOutfits);
    return () => unsubscribe();
  }, [navigation]);

  /**
   * 🔍 Hakee kaikki outfitit JA niiden vaatteet
   */
  const fetchOutfits = async () => {
    const outfitRows = await db.getAllAsync(
      `SELECT * FROM outfits ORDER BY createdAt DESC;`
    );

    const fullOutfits = [];

    for (const outfit of outfitRows) {
      const clothingItems = await db.getAllAsync(
        `
        SELECT clothing.*
        FROM outfit_clothing
        JOIN clothing ON clothing.id = outfit_clothing.clothingId
        WHERE outfit_clothing.outfitId = ?;
        `,
        outfit.id
      );

      fullOutfits.push({
        ...outfit,
        items: clothingItems, // 🔄 lisätään vaatteet tähän
      });
    }

    setOutfits(fullOutfits);
  };

  /**
   * 🗑 Poistaa asun + siihen liittyvät outfit_clothing -linkit
   */
  const deleteOutfit = async (id) => {
    await db.runAsync(`DELETE FROM outfits WHERE id = ?;`, id);
    fetchOutfits();
  };

  const renderOutfit = ({ item }) => {
    return (
      <Card style={globalStyles.card}>
        <Card.Title title={item.style} />
        <Card.Content>
          <View style={globalStyles.imageRow}>
            {item.items.map((clothing) => (
              <Image
                key={clothing.id}
                source={{ uri: clothing.imageUri }}
                style={globalStyles.image}
              />
            ))}
          </View>

          <Text style={globalStyles.savedText}>
            Saved: {new Date(item.createdAt).toLocaleString()}
          </Text>

          <View style={globalStyles.buttonRow}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EditOutFit', { outfitId: item.id })}
              style={[globalStyles.button, { backgroundColor: theme.colors.primary }]}
            >
              Update
            </Button>

            <Button
              mode="contained"
              onPress={() => deleteOutfit(item.id)}
              style={[globalStyles.button, { backgroundColor: theme.colors.error }]}
            >
              Delete
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <PaperProvider>
      <View style={globalStyles.container}>
        <Text variant="headlineMedium" style={globalStyles.title}>
          Saved Outfits
        </Text>

        <FlatList
          data={outfits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOutfit}
        />
      </View>
    </PaperProvider>
  );
}
