import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../config/theme';

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
      <Text style={styles.delete} onPress={() => deleteItem(item.id)}>Delete</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Add Clothing" onPress={() => navigation.navigate('AddClothing')} />
      <FlatList
        data={clothes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshing={false}
        onRefresh={updateList}
        ListEmptyComponent={<Text style={styles.empty}>No clothing saved yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.large,
    marginTop: theme.spacing.large,
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    marginBottom: theme.spacing.large,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.card,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    shadowOffset: theme.shadow.offset,
    elevation: theme.shadow.elevation,
  },
  image: {
    width: '100%',
    height: theme.imageHeight,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
  },
  placeholder: {
    width: '100%',
    height: theme.imageHeight,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small,
  },
  category: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium,
  },
  delete: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
  empty: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.placeholder,
  },
});

