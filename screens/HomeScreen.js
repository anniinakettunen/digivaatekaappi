import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Button, Alert, ImageBackground } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../config/theme';
import { globalStyles } from '../config/GlobalStyles';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [clothes, setClothes] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);

  const stylesList = ['Casual', 'Formal', 'Sport', 'Party'];

  // 🔥 Lisätty coat & cardigan
  const mainCategories = [
    'hat',
    'top',
    'bodysuit',
    'bottom',
    'shoes',
    'coat',       // uusi
    'cardigan'    // uusi
  ];

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
    const fetchData = async () => {
      await fetchClothes();
      try {
        const lastOutfit = await db.getFirstAsync(
          'SELECT * FROM outfits ORDER BY id DESC LIMIT 1'
        );

        if (lastOutfit) {
          const linkedItems = await db.getAllAsync(
            `
            SELECT clothing.*
            FROM outfit_clothing
            JOIN clothing ON clothing.id = outfit_clothing.clothingId
            WHERE outfit_clothing.outfitId = ?;
            `,
            lastOutfit.id
          );

          if (!selectedStyle) setSelectedStyle(lastOutfit.style);
          setSelectedItems(linkedItems);
        } else {
          if (!selectedStyle) setSelectedStyle(null);
          setSelectedItems([]);
        }
      } catch (error) {
        console.error('Error fetching last outfit:', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchData);
    return () => unsubscribe();
  }, [navigation, selectedStyle]);

  const addToOutfit = (item) => {
    const alreadySelected = selectedItems.find((i) => i.category === item.category);
    if (!alreadySelected) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(
        selectedItems.map((i) => (i.category === item.category ? item : i))
      );
    }
  };

  const removeFromOutfit = (id) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const saveOutfit = async () => {
    if (!selectedStyle) return Alert.alert('Virhe', 'Valitse tyyli ennen tallennusta.');
    if (selectedItems.length === 0)
      return Alert.alert('Virhe', 'Valitse vähintään yksi vaatekappale.');

    try {
      const result = await db.runAsync(
        'INSERT INTO outfits (style, createdAt) VALUES (?, ?);',
        selectedStyle,
        new Date().toISOString()
      );

      const newOutfitId = result.lastInsertRowId;

      for (const item of selectedItems) {
        await db.runAsync(
          'INSERT INTO outfit_clothing (outfitId, clothingId) VALUES (?, ?);',
          newOutfitId,
          item.id
        );
      }

      Alert.alert('Saved', 'Asu tallennettu!');
    } catch (error) {
      console.error('Failed to save outfit:', error);
      Alert.alert('Virhe', 'Tallennus epäonnistui. Aja "npx expo start --clear".');
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
          globalStyles.styleCircle,
          isSelected && globalStyles.styleCircleSelected
        ]}
        onPress={() => setSelectedStyle(style)}
      >
        <Text
          style={[
            globalStyles.styleText,
            isSelected && globalStyles.styleTextSelected
          ]}
        >
          {style}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCarouselItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => addToOutfit(item)}
      style={globalStyles.carouselItem}
    >
      <Image source={{ uri: item.imageUri }} style={globalStyles.carouselImage} />
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../assets/taustakuva.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={[globalStyles.container, { backgroundColor: 'rgba(255,255,255,0.4)' }]}>
        <View style={globalStyles.styleRow}>
          {stylesList.map(renderStyleCircle)}
        </View>

        <Text style={globalStyles.title}>Your Outfit</Text>

        <View style={globalStyles.outfitArea}>
          {(() => {
            // Korut
            const accessoryItems = accessoryCategories
              .map(cat => getItemByCategory(cat))
              .filter(Boolean);

            const chunkArray = (arr, size) => {
              const chunks = [];
              for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
              }
              return chunks;
            };

            const accessoryColumns = chunkArray(accessoryItems, 4);

            // Takki & neuletakki
            const coatItems = ['coat', 'cardigan']
              .map(cat => getItemByCategory(cat))
              .filter(Boolean);

            return (
              <View style={{ flexDirection: 'row', marginRight: 12 }}>
                {/* Korut */}
                {accessoryColumns.map((col, index) => (
                  <View key={index} style={{ flexDirection: 'column', alignItems: 'center', marginHorizontal: 6 }}>
                    {col.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => removeFromOutfit(item.id)}
                        style={[globalStyles.outfitItem, { marginVertical: 6 }]}
                      >
                        <Image source={{ uri: item.imageUri }} style={globalStyles.outfitImage} />
                        <Text style={globalStyles.outfitLabel}>{item.category.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}

                {/* Takki & neuletakki omalla sarakkeella vasemmalle */}
                {coatItems.length > 0 && (
                  <View style={{ flexDirection: 'column', alignItems: 'center', marginHorizontal: 6 }}>
                    {coatItems.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => removeFromOutfit(item.id)}
                        style={[globalStyles.outfitItem, { marginVertical: 6 }]}
                      >
                        <Image source={{ uri: item.imageUri }} style={globalStyles.outfitImage} />
                        <Text style={globalStyles.outfitLabel}>{item.category.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })()}

          {/* Main items pysyy ennallaan */}
          {(() => {
            const mainItems = mainCategories
              .filter(cat => cat !== 'coat' && cat !== 'cardigan')
              .map((category) => getItemByCategory(category))
              .filter(Boolean);

            const chunkArray = (arr, size) => {
              const chunks = [];
              for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
              }
              return chunks;
            };

            const columns = chunkArray(mainItems, 4);

            return (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'stretch'
                }}
              >
                {columns.map((colItems, colIndex) => (
                  <View
                    key={`col-${colIndex}`}
                    style={{
                      flexDirection: 'column',
                      alignItems: 'center',
                      marginHorizontal: 6,
                      justifyContent:
                        colIndex % 2 === 1 ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {colItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => removeFromOutfit(item.id)}
                        style={[globalStyles.outfitItem, { marginVertical: 6 }]}
                      >
                        <Image
                          source={{ uri: item.imageUri }}
                          style={globalStyles.outfitImage}
                        />
                        <Text style={globalStyles.outfitLabel}>
                          {item.category.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            );
          })()}
        </View>


        {selectedItems.length > 0 && (
          <View style={globalStyles.saveButton}>
            <Button
              title="Save Outfit"
              onPress={saveOutfit}
              color={theme.colors.primary}
            />
          </View>
        )}

        <View style={globalStyles.carouselWrapper}>
          <Text style={globalStyles.subtitle}>All Clothes</Text>
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
