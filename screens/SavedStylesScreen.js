import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../config/theme';

export default function SavedStylesScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [outfits, setOutfits] = useState([]);

  useEffect(() => {
    fetchOutfits();
    const unsubscribe = navigation.addListener('focus', fetchOutfits);
    return () => unsubscribe();
  }, [navigation]);

  const fetchOutfits = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM outfits ORDER BY createdAt DESC');
      setOutfits(result);
    } catch (error) {
      console.error('Error fetching outfits:', error);
    }
  };

  const deleteOutfit = async (id) => {
    try {
      await db.runAsync('DELETE FROM outfits WHERE id = ?;', id);
      fetchOutfits();
    } catch (error) {
      console.error('Failed to delete outfit:', error);
    }
  };

  const updateOutfit = (outfit) => {
    navigation.navigate('EditOutFit', { outfit });
  };

  const renderOutfit = ({ item }) => {
    const items = JSON.parse(item.items);

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.style}</Text>

        <View style={styles.imageRow}>
          {items.map((clothing) => (
            <Image
              key={clothing.id}
              source={{ uri: clothing.imageUri }}
              style={styles.image}
            />
          ))}
        </View>

        <Text style={styles.timestamp}>
          Saved: {new Date(item.createdAt).toLocaleString()}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => updateOutfit(item)}
          >
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteOutfit(item.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved Outfits</Text>
      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOutfit}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.large,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    color: theme.colors.textPrimary,
  },
  list: {
    paddingHorizontal: theme.spacing.medium,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: theme.spacing.small,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: theme.spacing.small,
    gap: 10,
  },
  updateButton: {
    backgroundColor: '#000000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
