import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../config/theme';
import { globalStyles } from '../config/GlobalStyles';
// HUOM: Jos käytät Button-komponenttia, sinun on tuotava se
import { Button } from 'react-native'; // Lisää tämä rivi, jos se puuttuu
import { TextInput } from 'react-native'; // Lisää tämä rivi, jos se puuttuu


export default function EditOutFitScreen() {
    const db = useSQLiteContext();
    const navigation = useNavigation();
    // 🔥 UUSI: Route params sisältää outfitId:n
    const { outfitId } = useRoute().params;

    const [outfit, setOutfit] = useState(null);
    const [clothes, setClothes] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedStyle, setSelectedStyle] = useState('');
    const [loading, setLoading] = useState(true);

    const stylesList = ['Casual', 'Formal', 'Sport', 'Party'];
    const mainCategories = ['hat', 'top', 'bodysuit', 'bottom', 'shoes'];
    const accessoryCategories = ['scarf', 'jewelry', 'bag'];

    // 1. Datan haku (Hakee asun tiedot JA kaikki vaatteet asusta)
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1.1 Hae itse asun tiedot
            const outfitData = await db.getFirstAsync(
                `SELECT * FROM outfits WHERE id = ?;`,
                outfitId
            );

            // 1.2 Hae kaikki vaatteet, jotka ovat linkitetty tähän asuun (MONI-MONEEN JOIN)
            const linkedClothing = await db.getAllAsync(
                `
                SELECT clothing.*
                FROM outfit_clothing
                JOIN clothing ON clothing.id = outfit_clothing.clothingId
                WHERE outfit_clothing.outfitId = ?;
                `,
                outfitId
            );

            // 1.3 Hae KAIKKI vaatekappaleet (karusellia varten)
            const allClothing = await db.getAllAsync('SELECT * FROM clothing');
            
            if (outfitData) {
                setOutfit(outfitData);
                setSelectedStyle(outfitData.style);
                setClothes(allClothing);
                // Asetetaan selectedItems-tilaan ne vaatteet, jotka ovat linkitetty asuun
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
        // Jos sama kategoria on jo valittu, korvataan se
        const alreadySelected = selectedItems.find((i) => i.category === item.category);
        if (!alreadySelected) setSelectedItems([...selectedItems, item]);
        else setSelectedItems(selectedItems.map((i) => (i.category === item.category ? item : i)));
    };

    const removeFromOutfit = (id) => {
        setSelectedItems(selectedItems.filter((i) => i.id !== id));
    };

    // 2. Päivityslogiikka (Luo/Poistaa linkityksiä outfit_clothing-taulussa)
    const updateOutfit = async () => {
        if (!selectedStyle) return Alert.alert('Virhe', 'Valitse tyyli ennen tallennusta.');
        if (selectedItems.length === 0) return Alert.alert('Virhe', 'Valitse vähintään yksi vaatekappale.');

        try {
            // 1. Päivitä asun style-nimi outfits-taulussa
            await db.runAsync(
                'UPDATE outfits SET style = ?, createdAt = ? WHERE id = ?;',
                selectedStyle,
                new Date().toISOString(),
                outfitId
            );

            // 2. Poista KAIKKI vanhat linkitykset outfit_clothing-taulusta
            await db.runAsync(
                'DELETE FROM outfit_clothing WHERE outfitId = ?;',
                outfitId
            );

            // 3. Luo uudet linkitykset (yksi linkki per vaate)
            for (const item of selectedItems) {
                await db.runAsync(
                    'INSERT INTO outfit_clothing (outfitId, clothingId) VALUES (?, ?);',
                    outfitId,
                    item.id // item.id on clothingId
                );
            }

            Alert.alert('Onnistui', 'Asu päivitetty!');
            navigation.goBack(); // Nonavigoi takaisin SavedStyles-näkymään

        } catch (error) {
            console.error('Failed to update outfit:', error);
            Alert.alert('Virhe', 'Päivitys epäonnistui.');
        }
    };

    const getItemByCategory = (category) => selectedItems.find((item) => item.category === category);

    // --- Renderöinti (muokkaamaton) ---
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

    // Tässä tarvitaan `TextInput` ja `Button`
    return (
        <View style={globalStyles.container}>
            {/* 🔘 Tyylit */}
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
            
            {/* Tässä tarvitaan TextInput-komponenttia, joka puuttui alkuperäisestä koodista*/}
            <TextInput
                placeholder="Style Name"
                value={selectedStyle}
                onChangeText={setSelectedStyle}
                style={globalStyles.input} // Käytä olemassa olevaa tyyliä
            />
        
            {selectedItems.length > 0 && (
                <View style={globalStyles.saveButton}>
                    {/* Tässä tarvitaan Button-komponenttia, joka puuttui alkuperäisestä koodista */}
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