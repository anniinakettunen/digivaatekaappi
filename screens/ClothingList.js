import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../config/theme';
import { globalStyles } from '../config/GlobalStyles';
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
    <View style={[globalStyles.card, { flex: 1 / 3 }]}>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={globalStyles.carouselImage} />
      ) : (
        <View style={[globalStyles.carouselImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.colors.textSecondary }}>No Image</Text>
        </View>
      )}

      <Text style={[globalStyles.subtitle, { fontSize: theme.typography.fontSize.small, marginTop: 4 }]}>
        {item.name}
      </Text>
      <Text style={[globalStyles.subtitle, { fontSize: theme.typography.fontSize.xsmall, color: theme.colors.textSecondary }]}>
        {item.category}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
        <TouchableOpacity onPress={() => editItem(item)} style={{ marginLeft: 8 }}>
          <FontAwesome6 name="pen-to-square" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteItem(item.id)} style={{ marginLeft: 8 }}>
          <FontAwesome6 name="trash-can" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={clothes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={3}
        refreshing={false}
        onRefresh={updateList}
        contentContainerStyle={{ paddingBottom: theme.spacing.large }}
        ListEmptyComponent={<Text style={[globalStyles.subtitle, { textAlign: 'center', marginTop: 30 }]}>No clothing saved yet.</Text>}
      />
    </View>
  );
}
