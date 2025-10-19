import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Button,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../config/theme';

const screenHeight = Dimensions.get('window').height;

export default function EditOutFitScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const { outfit } = useRoute().params;

  const [clothes, setClothes] = useState([]);
  const [selectedItems, setSelectedItems] = useState(JSON.parse(outfit.items));
  const [selectedStyle, setSelectedStyle] = useState(outfit.style);

  const stylesList = ['Casual', 'Formal', 'Sport', 'Party'];
  const mainCategories = ['hat', 'top', 'bodysuit', 'bottom', 'shoes'];
  const accessoryCategories = ['scarf', 'jewelry', 'bag'];

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

  const addToOutfit = (item) => {
    const alreadySelected = selectedItems.find((i) => i.category === item.category);
    if (!alreadySelected) {
      setSelectedItems([...selectedItems, item]);
    } else {
      const updated = selectedItems.map((i) =>
        i.category === item.category ? item : i
      );
      setSelectedItems(updated);
    }
  };

  const removeFromOutfit = (id) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const updateOutfit = async () => {
    if (!selectedStyle) {
      alert('Please select a style before saving.');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Please select at least one clothing item.');
      return;
    }

    try {
      const itemsJson = JSON.stringify(selectedItems);
      const timestamp = new Date().toISOString();

      await db.runAsync(
        'UPDATE outfits SET style = ?, items = ?, createdAt = ? WHERE id = ?;',
        selectedStyle,
        itemsJson,
        timestamp,
        outfit.id
      );

      alert('Outfit updated!');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update outfit:', error);
      alert('Update failed.');
    }
  };

  const getItemByCategory = (category) =>
    selectedItems.find((item) => item.category === category);

  const renderStyleCircle = (style) => {
    const isSelected = selectedStyle === style;

    return (
      <TouchableOpacity
        key={style}
        style={[
          styles.styleCircle,
          isSelected && styles.styleCircleSelected
        ]}
        onPress={() => setSelectedStyle(style)}
      >
        <Text style={[styles.styleText, isSelected && styles.styleTextSelected]}>
          {style}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCarouselItem = ({ item }) => (
    <TouchableOpacity onPress={() => addToOutfit(item)} style={styles.carouselItem}>
      <Image source={{ uri: item.imageUri }} style={styles.carouselImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 🔘 Vaatetyylit */}
      <View style={styles.styleRow}>
        {stylesList.map(renderStyleCircle)}
      </View>

      {/* 🧍‍♀️ Asukokonaisuus */}
      <Text style={styles.title}>Edit Outfit</Text>
      <View style={styles.outfitArea}>
        {/* 🎒 Asusteet vasemmalla rivissä */}
        <View style={styles.accessoryColumn}>
          <View style={styles.accessoryRow}>
            {accessoryCategories.map((category) => {
              const item = getItemByCategory(category);
              return item ? (
                <TouchableOpacity key={item.id} onPress={() => removeFromOutfit(item.id)} style={styles.accessoryItem}>
                  <Image source={{ uri: item.imageUri }} style={styles.accessoryImage} />
                  <Text style={styles.outfitLabel}>{category.toUpperCase()}</Text>
                </TouchableOpacity>
              ) : null;
            })}
          </View>
        </View>

        {/* 🧍‍♀️ Päävaatteet keskellä pystyrivissä */}
        <View style={styles.mainColumn}>
          {mainCategories.map((category) => {
            const item = getItemByCategory(category);
            return item ? (
              <TouchableOpacity key={item.id} onPress={() => removeFromOutfit(item.id)} style={styles.outfitItem}>
                <Image source={{ uri: item.imageUri }} style={styles.outfitImage} />
                <Text style={styles.outfitLabel}>{category.toUpperCase()}</Text>
              </TouchableOpacity>
            ) : null;
          })}
        </View>
      </View>

      {/* 💾 Päivitä-painike */}
      {selectedItems.length > 0 && (
        <View style={styles.saveButton}>
          <Button title="Update Outfit" onPress={updateOutfit} />
        </View>
      )}

      {/* 👕 Karuselli alhaalla */}
      <View style={styles.carouselWrapper}>
        <Text style={styles.subtitle}>Add or Replace Items</Text>
        <FlatList
          data={clothes}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCarouselItem}
          contentContainerStyle={styles.carouselList}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.large,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    color: theme.colors.textSecondary,
  },
  outfitArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.medium,
  },
  mainColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 10,
    width: 100,
  },
  accessoryColumn: {
    justifyContent: 'flex-start',
    marginRight: 10,
  },
  accessoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  outfitItem: {
    marginVertical: theme.spacing.xsmall,
    alignItems: 'center',
  },
  accessoryItem: {
    marginHorizontal: theme.spacing.xsmall,
    alignItems: 'center',
  },
  outfitImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  accessoryImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  outfitLabel: {
    marginTop: 2,
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    marginTop: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
  },
  styleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.medium,
  },
  styleCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleCircleSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  styleText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  styleTextSelected: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  carouselWrapper: {
    marginTop: theme.spacing.large,
    paddingBottom: theme.spacing.large,
  },
  carouselList: {
    paddingHorizontal: theme.spacing.medium,
  },
  carouselItem: {
    marginRight: theme.spacing.small,
  },
  carouselImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
});
