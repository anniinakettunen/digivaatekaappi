import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';

const categories = ['top', 'bottom', 'shoes', 'bodysuit', 'bag', 'hat'];
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
      if (!route.params?.item) {
        setName('');
        setCategory('');
        setSeason('');
        setMaterial('');
        setColor('');
        setImageUri(null);
      }
    }, [route.params])
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
          if (status !== 'granted') return Alert.alert('Permission denied', 'Camera access is needed.');
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
          if (!result.canceled && result.assets?.length > 0) setImageUri(result.assets[0].uri);
        },
      },
      {
        text: 'Choose from gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') return Alert.alert('Permission denied', 'Gallery access is needed.');
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, quality: 1 });
          if (!result.canceled && result.assets?.length > 0) setImageUri(result.assets[0].uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const saveClothing = async () => {
    if (!name.trim() || !category || !season || !imageUri) {
      return Alert.alert('Missing fields', 'Please fill in all required fields and add an image.');
    }

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
        Alert.alert('Updated', 'Clothing updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
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
        Alert.alert('Saved', 'Clothing saved!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Saving failed.');
    }
  };

  const renderDropdown = (field, options, value, setValue) => (
    <Modal transparent visible={dropdownVisible.visible && dropdownVisible.field === field} animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setDropdownVisible({ field: '', visible: false })}
      >
        <View style={styles.modalBox}>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setValue(item);
                  setDropdownVisible({ field: '', visible: false });
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderDropdownField = (label, field, options, value, setValue) => (
    <View style={styles.dropdownField}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setDropdownVisible({ field, visible: true })}
      >
        <Text style={{ color: value ? '#000' : '#888' }}>{value || `Select ${label.toLowerCase()}...`}</Text>
      </TouchableOpacity>
      {renderDropdown(field, options, value, setValue)}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Clothing</Text>

        <View style={styles.imageWrapper}>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <Text style={styles.imagePlaceholder}>Tap to add photo</Text>
            )}
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="Clothing name" value={name} onChangeText={setName} />
        {renderDropdownField('Category', 'category', categories, category, setCategory)}
        {renderDropdownField('Season', 'season', seasons, season, setSeason)}

        <TextInput style={styles.input} placeholder="Material" value={material} onChangeText={setMaterial} />
        <TextInput style={styles.input} placeholder="Color" value={color} onChangeText={setColor} />

        <TouchableOpacity style={styles.saveButton} onPress={saveClothing}>
          <Text style={styles.saveText}>{editingItem ? 'Update' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  imageWrapper: { alignItems: 'center', marginBottom: 16 },
  imagePicker: { width: 180, height: 180, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f8f8' },
  image: { width: '100%', height: '100%', borderRadius: 12, resizeMode: 'cover' },
  imagePlaceholder: { color: '#666', fontSize: 15 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, marginVertical: 6, fontSize: 15, backgroundColor: '#fafafa' },
  dropdownField: { width: '100%', marginVertical: 6 },
  label: { fontSize: 14, color: '#555', marginBottom: 4 },
  dropdownButton: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#fafafa' },
  saveButton: { backgroundColor: '#3CB371', paddingVertical: 12, borderRadius: 10, marginTop: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 40 },
  modalBox: { backgroundColor: '#fff', borderRadius: 10, maxHeight: 250 },
  modalItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItemText: { fontSize: 16 },
});
