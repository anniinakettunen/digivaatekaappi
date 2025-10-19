import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { Image } from 'react-native';

import AppNavigator from './AppNavigator';
import { initialData } from './data/ClothingData'; 

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
        'INSERT INTO clothing (name, category, season, material, color, imageUri) VALUES (?, ?, ?, ?, ?, ?);',
        item.name,
        item.category,
        item.season,
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
