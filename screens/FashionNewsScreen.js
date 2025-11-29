import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ImageBackground, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../config/theme';
import { globalStyles } from '../config/GlobalStyles';

export default function FashionNewsScreen() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const STORAGE_KEY = 'cachedFashionNews';

  const fetchFashionNews = async () => {
    setLoading(true);
    try {
      const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (cachedData) setArticles(JSON.parse(cachedData));

      const res = await fetch(
        'https://newsdata.io/api/1/news?apikey=pub_62976f0571a44797a7c823f90e440025&q=fashion&language=en'
      );
      const data = await res.json();
      if (data.results) {
        setArticles(data.results);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.results));
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
      style={[globalStyles.newsCard, { backgroundColor: 'rgba(255,255,255,0.8)' }]} 
      onPress={() => item.link && Linking.openURL(item.link)}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={globalStyles.newsImage} />
      ) : (
        <View style={[globalStyles.newsImage, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.colors.textSecondary }}>No Image</Text>
        </View>
      )}
      <View style={globalStyles.newsTextContainer}>
        <Text style={globalStyles.newsTitle} numberOfLines={2}>{item.title}</Text>
        {item.source_id && <Text style={globalStyles.newsSource}>{item.source_id}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../assets/taustakuva.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={[globalStyles.container, { backgroundColor: 'transparent', padding: 10 }]}>
        <FlatList
          data={articles}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshing={loading}
          onRefresh={fetchFashionNews}
        />
      </View>
    </ImageBackground>
  );
}
