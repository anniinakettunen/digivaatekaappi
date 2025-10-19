import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../config/theme';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';


export default function ClothingList() {
  const [clothes, setClothes] = useState([]);
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const updateList = async () => {
    if (!db) return;
    try {
      const list = await db.getAllAsync('SELECT * FROM clothing');
      setClothes(list);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const deleteItem = (id) => {
    Alert.alert(
      'Confirm delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM clothing WHERE id=?', id);
              await updateList();
            } catch (error) {
              console.error('Failed to delete item:', error);
            }
          },
        },
      ]
    );
  };

  const editItem = (item) => {
    navigation.navigate('Add New', { item });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', updateList);
    return () => unsubscribe();
  }, [navigation]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}><Text>No image</Text></View>
      )}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>

      <View style={styles.iconRow}>
        <TouchableOpacity onPress={() => editItem(item)} style={styles.iconButton}>
          <FontAwesome6 name="pen-to-square" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.iconButton}>
          <FontAwesome6 name="trash-can" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clothes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={3}
        refreshing={false}
        onRefresh={updateList}
        ListEmptyComponent={<Text style={styles.empty}>No clothing saved yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    flex: 1,
    margin: theme.spacing.small,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.card,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    paddingHorizontal: 6,
    paddingTop: 4,
  },
  category: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  iconButton: {
    marginLeft: 8,
  },
  empty: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.placeholder,
  },
});
