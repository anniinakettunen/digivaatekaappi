import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [clothes, setClothes] = useState([]);

  const fetchClothes = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM clothing');
      setClothes(result);
    } catch (error) {
      console.error('Error fetching clothes:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchClothes);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Navigointinapit */}
      <Button
        title="View Full Clothing List"
        onPress={() => navigation.navigate('ClothingList')}
      />
      <Button
        title="Add New Clothing"
        onPress={() => navigation.navigate('AddClothing')}
      />

      <FlatList
        data={clothes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No clothing saved yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fafafa',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  category: { fontSize: 16, color: '#666', marginBottom: 10 },
  image: { width: '100%', height: 200, borderRadius: 10, resizeMode: 'cover' },
  placeholder: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#888' },
  empty: { textAlign: 'center', marginTop: 30, fontSize: 16, color: '#777' },
});
