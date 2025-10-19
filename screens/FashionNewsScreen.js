import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Linking, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../config/theme';

const screenWidth = Dimensions.get('window').width;

export default function FashionNewsScreen() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const STORAGE_KEY = 'cachedFashionNews';

  const fetchFashionNews = async () => {
    setLoading(true);

    try {
      // 🔹 Yritetään ensin hakea välimuisti
      const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (cachedData) {
        setArticles(JSON.parse(cachedData));
      }

      // 🔹 Hae aina API:sta, mutta vain jos ei välimuistia tai halutaan päivitys
      const res = await fetch(
        'https://newsdata.io/api/1/news?apikey=pub_62976f0571a44797a7c823f90e440025&q=fashion&language=en'
      );
      const data = await res.json();
      if (data.results) {
        setArticles(data.results);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.results)); // päivitämme välimuistin
      }
    } catch (err) {
      console.error('Error fetching fashion news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFashionNews();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => item.link && Linking.openURL(item.link)}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.colors.textSecondary }}>No Image</Text>
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.source_id && <Text style={styles.source}>{item.source_id}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={loading} // tuo React Native "pull to refresh" efektin
        onRefresh={fetchFashionNews} // päivitysvedolla päivittyy API:sta
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContent: { padding: 16 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#ccc',
  },
  textContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  source: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
