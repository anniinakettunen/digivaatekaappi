import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, ImageBackground, TextInput, Button } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../config/theme';
import { globalStyles } from '../config/GlobalStyles';

export default function EditOutFitScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const { outfitId } = useRoute().params;

  const [outfit, setOutfit] = useState(null);
  const [clothes, setClothes] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [loading, setLoading] = useState(true);

  const stylesList = ['Casual', 'Formal', 'Sport', 'Party'];
  const mainCategories = ['hat', 'top', 'bodysuit', 'bottom', 'shoes'];
  const accessoryCategories = ['scarf', 'jewelry', 'bag'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const outfitData = await db.getFirstAsync(`SELECT * FROM outfits WHERE id = ?;`, outfitId);
      const linkedClothing = await db.getAllAsync(
        `SELECT clothing.* FROM outfit_clothing
         JOIN clothing ON clothing.id = outfit_clothing.clothingId
         WHERE outfit_clothing.outfitId = ?;`,
        outfitId
      );
      const allClothing = await db.getAllAsync('SELECT * FROM clothing');

      if (outfitData) {
        setOutfit(outfitData);
        setSelectedStyle(outfitData.style);
        setClothes(allClothing);
        setSelectedItems(linkedClothing);
      }
    } catch (error) {
      console.error('Error fetching outfit data:', error);
      Alert.alert('Virhe', 'Asun tietojen lataus epäonnistui.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', fetchData);
    return () => unsubscribe();
  }, [navigation, outfitId]);

  const addToOutfit = (item) => {
    const alreadySelected = selectedItems.find((i) => i.category === item.category);
    if (!alreadySelected) setSelectedItems([...selectedItems, item]);
    else setSelectedItems(selectedItems.map((i) => (i.category === item.category ? item : i)));
  };

  const removeFromOutfit = (id) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const updateOutfit = async () => {
    if (!selectedStyle) return Alert.alert('Virhe', 'Valitse tyyli ennen tallennusta.');
    if (selectedItems.length === 0) return Alert.alert('Virhe', 'Valitse vähintään yksi vaatekappale.');

    try {
      await db.runAsync('UPDATE outfits SET style = ?, createdAt = ? WHERE id = ?;',
        selectedStyle, new Date().toISOString(), outfitId
      );
      await db.runAsync('DELETE FROM outfit_clothing WHERE outfitId = ?;', outfitId);
      for (const item of selectedItems) {
        await db.runAsync('INSERT INTO outfit_clothing (outfitId, clothingId) VALUES (?, ?);', outfitId, item.id);
      }
      Alert.alert('Onnistui', 'Asu päivitetty!');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update outfit:', error);
      Alert.alert('Virhe', 'Päivitys epäonnistui.');
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

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <Text>Ladataan asun tietoja...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/taustakuva.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={[globalStyles.container, { backgroundColor: 'rgba(255,255,255,0.4)' }]}>
        {/* Tyylit */}
        <View style={globalStyles.styleRow}>{stylesList.map(renderStyleCircle)}</View>

        <Text style={globalStyles.title}>Edit Outfit: {outfit?.style}</Text>

        <View style={globalStyles.outfitArea}>
          {/* Asusteet */}
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

          {/* Päävaatteet */}
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

        <TextInput
          placeholder="Style Name"
          value={selectedStyle}
          onChangeText={setSelectedStyle}
          style={globalStyles.input}
        />

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
    </ImageBackground>
  );
}
