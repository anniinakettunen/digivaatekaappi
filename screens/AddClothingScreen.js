import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ImageBackground
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { globalStyles } from '../config/GlobalStyles';

const categories = [
  'top',
  'bottom',
  'shoes',
  'bodysuit',
  'bag',
  'hat',
  'coat',
  'cardigan'
];

const seasons = ['summer', 'autumn', 'winter', 'spring'];

export default function AddClothingScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [season, setSeason] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState({ field: '', visible: false });

  const db = useSQLiteContext();
  const navigation = useNavigation();
  const route = useRoute();
  const editingItem = route.params?.item;

  useFocusEffect(
    useCallback(() => {
      if (!editingItem) {
        setName('');
        setCategory('');
        setSeason('');
        setMaterial('');
        setColor('');
        setImageUri(null);
      }
    }, [editingItem])
  );

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
      setCategory(editingItem.category || '');
      setSeason(editingItem.season || '');
      setMaterial(editingItem.material || '');
      setColor(editingItem.color || '');
      setImageUri(editingItem.imageUri || null);
    }
  }, [editingItem]);

  const pickImage = async () => {
    Alert.alert('Add photo', 'Choose a photo source', [
      {
        text: 'Take photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted')
            return Alert.alert('Permission denied', 'Camera access is needed.');
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
          if (!result.canceled && result.assets?.length > 0) setImageUri(result.assets[0].uri);
        },
      },
      {
        text: 'Choose from gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted')
            return Alert.alert('Permission denied', 'Gallery access is needed.');
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
          });
          if (!result.canceled && result.assets?.length > 0) setImageUri(result.assets[0].uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const saveClothing = async () => {
    if (!name.trim() || !category || !season || !imageUri)
      return Alert.alert('Missing fields', 'Please fill in all required fields and add an image.');

    try {
      if (editingItem) {
        await db.runAsync(
          'UPDATE clothing SET name=?, category=?, season=?, material=?, color=?, imageUri=? WHERE id=?;',
          name.trim(),
          category,
          season,
          material.trim(),
          color.trim(),
          imageUri,
          editingItem.id
        );
        navigation.setParams({ item: undefined });
        Alert.alert('Updated', 'Clothing updated!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await db.runAsync(
          'INSERT INTO clothing (name, category, season, material, color, imageUri) VALUES (?, ?, ?, ?, ?, ?);',
          name.trim(),
          category,
          season,
          material.trim(),
          color.trim(),
          imageUri
        );
        Alert.alert('Saved', 'Clothing saved!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Saving failed.');
    }
  };

  const renderDropdown = (field, options, value, setValue) => (
    <Modal
      transparent
      visible={dropdownVisible.visible && dropdownVisible.field === field}
      animationType="fade"
    >
      <TouchableOpacity
        style={globalStyles.addClothing.modalOverlay}
        activeOpacity={1}
        onPress={() => setDropdownVisible({ field: '', visible: false })}
      >
        <View style={globalStyles.addClothing.modalBox}>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={globalStyles.addClothing.modalItem}
                onPress={() => {
                  setValue(item);
                  setDropdownVisible({ field: '', visible: false });
                }}
              >
                <Text style={globalStyles.addClothing.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderDropdownField = (label, field, options, value, setValue) => (
    <View style={globalStyles.addClothing.dropdownField}>
      <Text style={globalStyles.addClothing.label}>{label}</Text>
      <TouchableOpacity
        style={globalStyles.addClothing.dropdownButton}
        onPress={() => setDropdownVisible({ field, visible: true })}
      >
        <Text style={{ color: value ? '#000' : '#888' }}>
          {value || `Select ${label.toLowerCase()}...`}
        </Text>
      </TouchableOpacity>
      {renderDropdown(field, options, value, setValue)}
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/taustakuva.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[globalStyles.addClothing.container, { backgroundColor: 'rgba(255,255,255,0.4)' }]}>
          <Text style={globalStyles.addClothing.title}>Add Clothing</Text>

          <View style={globalStyles.addClothing.imageWrapper}>
            <TouchableOpacity
              style={globalStyles.addClothing.imagePicker}
              onPress={pickImage}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={globalStyles.addClothing.image} />
              ) : (
                <Text style={globalStyles.addClothing.imagePlaceholder}>
                  Tap to add photo
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            style={globalStyles.addClothing.input}
            placeholder="Clothing name"
            value={name}
            onChangeText={setName}
          />

          {renderDropdownField('Category', 'category', categories, category, setCategory)}
          {renderDropdownField('Season', 'season', seasons, season, setSeason)}

          <TextInput
            style={globalStyles.addClothing.input}
            placeholder="Material"
            value={material}
            onChangeText={setMaterial}
          />

          <TextInput
            style={globalStyles.addClothing.input}
            placeholder="Color"
            value={color}
            onChangeText={setColor}
          />

          <TouchableOpacity
            style={globalStyles.addClothing.saveButton}
            onPress={saveClothing}
          >
            <Text style={globalStyles.addClothing.saveText}>
              {editingItem ? 'Update' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
