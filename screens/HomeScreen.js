import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Button, Alert } from 'react-native';
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
  const mainCategories = ['hat', 'top', 'bodysuit', 'bottom', 'shoes'];
  const accessoryCategories = ['scarf', 'jewelry', 'bag'];

  // Hakee KAIKKI vaatteet karusellia varten
  const fetchClothes = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM clothing');
      setClothes(result);
    } catch (error) {
      console.error('Error fetching clothes:', error);
    }
  };

  // 1. 🔥 KORJAUS: Muutetaan logiikka käyttämään uutta moni-moneen-rakennetta
  // Sovelluksen käynnistyksen yhteydessä haetaan viimeksi tallennettu asu
  useEffect(() => {
    const fetchData = async () => {
      await fetchClothes();
      try {
        // Hakee viimeisen outfitin ID:n
        const lastOutfit = await db.getFirstAsync('SELECT * FROM outfits ORDER BY id DESC LIMIT 1');
        
        if (lastOutfit) {
            // Hakee asuun linkitetyt vaatteet uuden linkkitaulun kautta (Oikea rakenne)
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
            // Asetetaan haetut vaatteet (items)
            setSelectedItems(linkedItems); 
        } else {
            if (!selectedStyle) setSelectedStyle(null);
            setSelectedItems([]);
        }
      } catch (error) {
        console.error('Error fetching last outfit:', error);
        // Huom: Tämä virhe voi tulla, jos dataa ei ole vielä tallennettu uuteen rakenteeseen
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

  // 2. 🔥 KORJAUS: Muutetaan tallennus luomaan linkit (EI items-saraketta)
  const saveOutfit = async () => {
    if (!selectedStyle) return Alert.alert('Virhe', 'Valitse tyyli ennen tallennusta.');
    if (selectedItems.length === 0) return Alert.alert('Virhe', 'Valitse vähintään yksi vaatekappale.');

    try {
        // 1. Luo uusi outfit-rivi (EI items-saraketta!)
        const result = await db.runAsync(
            'INSERT INTO outfits (style, createdAt) VALUES (?, ?);',
            selectedStyle,
            new Date().toISOString()
        );

        const newOutfitId = result.lastInsertRowId;

        // 2. Luo linkit outfit_clothing-tauluun (MONI-MONEEN)
        for (const item of selectedItems) {
            await db.runAsync(
            'INSERT INTO outfit_clothing (outfitId, clothingId) VALUES (?, ?);',
            newOutfitId,
            item.id // item.id on clothingId
            );
        }

        Alert.alert('Saved', 'Asu tallennettu!');
    } catch (error) {
        console.error('Failed to save outfit:', error);
        // TÄMÄ VIRHE TULEE, JOS items-SARAKE ON VIELÄ JÄLJELLÄ DB:SSÄ!
        Alert.alert('Virhe', 'Tallennus epäonnistui. Muista ajaa "npx expo start --clear".');
    }
  };

  const getItemByCategory = (category) => selectedItems.find((item) => item.category === category);

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
    <TouchableOpacity onPress={() => addToOutfit(item)} style={globalStyles.carouselItem}>
      <Image source={{ uri: item.imageUri }} style={globalStyles.carouselImage} />
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.styleRow}>
        {stylesList.map(renderStyleCircle)}
      </View>

      <Text style={globalStyles.title}>Your Outfit</Text>
      <View style={globalStyles.outfitArea}>

        {/* --- ACCESSORIES (scarf, jewelry, bag) pystyrivissä --- */}
        <View style={globalStyles.accessoryColumn}>
          <View style={{ flexDirection: 'column', alignItems: 'center' }}>
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

        {/* --- MAIN CATEGORIES (4 vaatetta per pystyrivi, seuraava sarake oikealle) --- */}
        {(() => {
          const mainItems = mainCategories
            .map((category) => getItemByCategory(category))
            .filter(Boolean);

          // Jaetaan joka 4. item uusiin sarakkeisiin
          const chunkArray = (arr, size) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
              chunks.push(arr.slice(i, i + size));
            }
            return chunks;
          };

          const columns = chunkArray(mainItems, 4);

          return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch' }}>
              {columns.map((colItems, colIndex) => (
                <View
                  key={`col-${colIndex}`}
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginHorizontal: 6,
                    justifyContent: colIndex % 2 === 1 ? 'flex-end' : 'flex-start', // parilliset ylhäältä, parittomat alhaalta
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
          <Button title="Save Outfit" onPress={saveOutfit} color={theme.colors.primary} />
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
  );
}