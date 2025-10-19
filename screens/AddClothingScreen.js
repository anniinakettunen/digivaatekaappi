import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';

export default function AddClothingScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [season, setSeason] = useState('');
  const [weather, setWeather] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');

  const db = useSQLiteContext();
  const navigation = useNavigation();
  const route = useRoute();
  const editingItem = route.params?.item;

  // 🔄 Tyhjennä kentät kun näkymä saa fokuksen ilman muokkausdataa
  useFocusEffect(
    useCallback(() => {
      if (!route.params?.item) {
        setName('');
        setCategory('');
        setSeason('');
        setWeather('');
        setMaterial('');
        setColor('');
        setImageUri(null);
      }
    }, [route.params])
  );

  // 📝 Esitäytä kentät kun muokataan
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
      setCategory(editingItem.category || '');
      setSeason(editingItem.season || '');
      setWeather(editingItem.weather || '');
      setMaterial(editingItem.material || '');
      setColor(editingItem.color || '');
      setImageUri(editingItem.imageUri || null);
    }
  }, [editingItem]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image selection failed:', error);
      Alert.alert('Error', 'Image selection failed. Please try again.');
    }
  };

  const saveClothing = async () => {
    if (!name.trim() || !category.trim() || !imageUri) {
      Alert.alert('Missing fields', 'Please fill in all fields and select an image.');
      return;
    }

    try {
      if (editingItem) {
        await db.runAsync(
          'UPDATE clothing SET name=?, category=?, season=?, weather=?, material=?, color=?, imageUri=? WHERE id=?;',
          name.trim(),
          category.trim(),
          season.trim(),
          weather.trim(),
          material.trim(),
          color.trim(),
          imageUri,
          editingItem.id
        );

        // ✅ Tyhjennä params nyt, kun muokkaus on valmis
        navigation.setParams({ item: undefined });

        Alert.alert('Updated', 'Clothing updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await db.runAsync(
          'INSERT INTO clothing (name, category, season, weather, material, color, imageUri) VALUES (?, ?, ?, ?, ?, ?, ?);',
          name.trim(),
          category.trim(),
          season.trim(),
          weather.trim(),
          material.trim(),
          color.trim(),
          imageUri
        );

        Alert.alert('Saved', 'Clothing saved successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);

        // ✅ Tyhjennä kentät uuden jälkeen
        setName('');
        setCategory('');
        setSeason('');
        setWeather('');
        setMaterial('');
        setColor('');
        setImageUri(null);
      }
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert('Error', 'Saving failed. Please try again later.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput style={styles.input} placeholder="Clothing name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Category (e.g. Top, Bottom)" value={category} onChangeText={setCategory} />
        <TextInput style={styles.input} placeholder="Season (e.g. Summer, Winter)" value={season} onChangeText={setSeason} />
        <TextInput style={styles.input} placeholder="Weather (e.g. Sunny, Rainy)" value={weather} onChangeText={setWeather} />
        <TextInput style={styles.input} placeholder="Material (e.g. Cotton, Denim)" value={material} onChangeText={setMaterial} />
        <TextInput style={styles.input} placeholder="Color" value={color} onChangeText={setColor} />

        <View style={styles.buttonContainer}>
          <Button title="Pick image from gallery" onPress={pickImage} />
        </View>

        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

        <View style={styles.buttonContainer}>
          <Button title={editingItem ? 'Update clothing' : 'Save clothing'} onPress={saveClothing} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: 12,
    marginVertical: 20,
    resizeMode: 'cover',
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 8,
  },
});
