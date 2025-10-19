import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Button } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../config/theme';
import { globalStyles } from '../config/GlobalStyles';

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

  // Hae vaatteet
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
    if (!alreadySelected) setSelectedItems([...selectedItems, item]);
    else setSelectedItems(selectedItems.map((i) => (i.category === item.category ? item : i)));
  };

  const removeFromOutfit = (id) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const updateOutfit = async () => {
    if (!selectedStyle) return alert('Please select a style before saving.');
    if (selectedItems.length === 0) return alert('Please select at least one clothing item.');

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

  const getItemByCategory = (category) => selectedItems.find((item) => item.category === category);

  const renderStyleCircle = (style) => {
    const isSelected = selectedStyle === style;
    return (
      <TouchableOpacity
        key={style}
        style={[globalStyles.styleCircle, isSelected && globalStyles.styleCircleSelected]}
        onPress={() => setSelectedStyle(style)}
      >
        <Text style={[globalStyles.styleText, isSelected && globalStyles.styleTextSelected]}>
          {style}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCarouselItem = ({ item }) => (
    <TouchableOpacity onPress={() => addToOutfit(item)} style={globalStyles.carouselItem}>
      <Image source={{ uri: item.imageUri }} style={globalStyles.carouselImage} />
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      {/* 🔘 Tyylit */}
      <View style={globalStyles.styleRow}>{stylesList.map(renderStyleCircle)}</View>


      <Text style={globalStyles.title}>Edit Outfit</Text>
      <View style={globalStyles.outfitArea}>
        <View style={globalStyles.accessoryColumn}>
          <View style={globalStyles.accessoryRow}>
            {accessoryCategories.map((category) => {
              const item = getItemByCategory(category);
              return item ? (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => removeFromOutfit(item.id)}
                  style={globalStyles.accessoryItem}
                >
                  <Image source={{ uri: item.imageUri }} style={globalStyles.accessoryImage} />
                  <Text style={globalStyles.outfitLabel}>{category.toUpperCase()}</Text>
                </TouchableOpacity>
              ) : null;
            })}
          </View>
        </View>

        <View style={globalStyles.mainColumn}>
          {mainCategories.map((category) => {
            const item = getItemByCategory(category);
            return item ? (
              <TouchableOpacity
                key={item.id}
                onPress={() => removeFromOutfit(item.id)}
                style={globalStyles.outfitItem}
              >
                <Image source={{ uri: item.imageUri }} style={globalStyles.outfitImage} />
                <Text style={globalStyles.outfitLabel}>{category.toUpperCase()}</Text>
              </TouchableOpacity>
            ) : null;
          })}
        </View>
      </View>

  
      {selectedItems.length > 0 && (
        <View style={globalStyles.saveButton}>
          <Button title="Update Outfit" onPress={updateOutfit} color={theme.colors.primary} />
        </View>
      )}

    
      <View style={globalStyles.carouselWrapper}>
        <Text style={globalStyles.subtitle}>Add or Replace Items</Text>
        <FlatList
          data={clothes}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCarouselItem}
          contentContainerStyle={globalStyles.carouselList}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
}
