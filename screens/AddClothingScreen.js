import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';

export default function AddClothingScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const db = useSQLiteContext();
  const navigation = useNavigation();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', // moderni tapa
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
      await db.runAsync(
        'INSERT INTO clothing (name, category, imageUri) VALUES (?, ?, ?);',
        name.trim(),
        category.trim(),
        imageUri
      );

      Alert.alert('Success', 'Clothing saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);

      // Reset state
      setName('');
      setCategory('');
      setImageUri(null);
    } catch (error) {
      console.error('Insert failed:', error);
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
        <TextInput
          style={styles.input}
          placeholder="Clothing name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Category (e.g. Top, Bottom)"
          value={category}
          onChangeText={setCategory}
        />

        <View style={styles.buttonContainer}>
          <Button title="Pick image from gallery" onPress={pickImage} />
        </View>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} />
        )}

        <View style={styles.buttonContainer}>
          <Button title="Save clothing" onPress={saveClothing} />
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