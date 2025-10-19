import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import ClothingList from './screens/ClothingList';
import AddClothingScreen from './screens/AddClothingScreen';
import HomeScreen from './screens/HomeScreen';
import SavedStylesScreen from './screens/SavedStylesScreen';
import AppNavigator from './AppNavigator'; 


const Tab = createBottomTabNavigator();


// Preloaded clothing data
const initialData = [
  {
    name: 'T-shirt',
    category: 'top',
    season: 'summer',
    weather: 'sunny',
    material: 'cotton',
    color: 'white',
    image: require('./assets/paita1.jpg'),
  },
  {
    name: 'T-shirt',
    category: 'top',
    season: 'summer',
    weather: 'sunny',
    material: 'cotton',
    color: 'white',
    image: require('./assets/paita2.jpg'),
  },
  {
    name: 'Blouse',
    category: 'top',
    season: 'summer',
    weather: 'sunny',
    material: 'cotton',
    color: 'white',
    image: require('./assets/paita3.jpg'),
  },
  {
    name: 'Jeans',
    category: 'bottom',
    season: 'winter',
    weather: 'cold',
    material: 'denim',
    color: 'blue',
    image: require('./assets/housut.jpg'),
  },
  {
    name: 'Heels',
    category: 'shoes',
    season: 'summer',
    weather: 'sunny',
    material: 'leather',
    color: 'black',
    image: require('./assets/kengät1.jpg'),
  },
  {
    name: 'Dress',
    category: 'bodysuit',
    season: 'summer',
    weather: 'sunny',
    material: 'cotton',
    color: 'green',
    image: require('./assets/mekko.jpg'),
  },
  {
    name: 'Jumpsuite',
    category: 'bodysuit',
    season: 'summer',
    weather: 'sunny',
    material: 'cotton',
    color: 'green',
    image: require('./assets/jumpsuite.jpg'),
  },
  {
    name: 'Bag',
    category: 'bag',
    season: 'summer',
    weather: 'sunny',
    material: 'leather',
    color: 'brown',
    image: require('./assets/laukku1.jpg'),
  },
  {
    name: 'Burgundy bag',
    category: 'bag',
    season: 'autumn',
    weather: 'cloudy',
    material: 'leather',
    color: 'red',
    image: require('./assets/laukku2.jpg'),
  },
  {
    name: 'Party Bag',
    category: 'bag',
    season: 'summer',
    weather: 'sunny',
    material: 'leather',
    color: 'black',
    image: require('./assets/laukku3.jpg'),
  },
  {
    name: 'Laptop Bag',
    category: 'bag',
    season: 'autumn',
    weather: 'cloudy',
    material: 'leather',
    color: 'brown',
    image: require('./assets/laukku4.jpg'),
  },
  {
    name: 'Fashion Bag',
    category: 'bag',
    season: 'autumn',
    weather: 'cloudy',
    material: 'polyester',
    color: 'brown',
    image: require('./assets/laukku5.jpg'),
  },

  {
    name: 'Cap',
    category: 'hat',
    season: 'summer',
    weather: 'sunny',
    material: 'cotton',
    color: 'white',
    image: require('./assets/hattu1.jpg'),
  },
  {
    name: 'Knit Cap',
    category: 'hat',
    season: 'winter',
    weather: 'cold',
    material: 'cotton',
    color: 'white',
    image: require('./assets/hattu2.jpg'),
  },
  {
    name: 'Shorts',
    category: 'bottom',
    season: 'summer',
    weather: 'sunny',
    material: 'denim',
    color: 'blue',
    image: require('./assets/housut2.jpg'),
  },
  {
    name: 'Ankle Boots',
    category: 'shoes',
    season: 'autumn',
    weather: 'cloudy',
    material: 'leather',
    color: 'black',
    image: require('./assets/kengät2.jpg'),
  },
  {
    name: 'Rain Boots',
    category: 'shoes',
    season: 'autumn',
    weather: 'rainy',
    material: 'leather',
    color: 'blue',
    image: require('./assets/kengät3.jpg'),
  },

];


export default function App() {
  const initialize = async (db) => {
    // Tyhjennetään vanha clothing-taulu
    await db.execAsync(`DROP TABLE IF EXISTS clothing;`);
    await db.execAsync(`
      CREATE TABLE clothing (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT,
        category TEXT,
        season TEXT,
        weather TEXT,
        material TEXT,
        color TEXT,
        imageUri TEXT
      );
    `);

    // Luodaan uusi outfits-taulu
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS outfits (
        id INTEGER PRIMARY KEY NOT NULL,
        style TEXT,
        items TEXT,
        createdAt TEXT
      );
    `);

    // Esitäytetään clothing-taulu
    for (const item of initialData) {
      await db.runAsync(
        'INSERT INTO clothing (name, category, season, weather, material, color, imageUri) VALUES (?, ?, ?, ?, ?, ?, ?);',
        item.name,
        item.category,
        item.season,
        item.weather,
        item.material,
        item.color,
        Image.resolveAssetSource(item.image).uri
      );
    }
  };

  return (
    <SQLiteProvider
      databaseName="wardrobe.db"
      onInit={initialize}
      onError={(error) => console.error('Database error:', error)}
    >
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SQLiteProvider>
  );
}