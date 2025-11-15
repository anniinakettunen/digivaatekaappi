import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { Image } from 'react-native';

import AppNavigator from './AppNavigator';
import { initialData } from './data/ClothingData'; 

// 🔥 HUOM: Lisää `DROP TABLE IF EXISTS outfits;` korjataksesi vanhan virheen
const initialize = async (db) => {

  // 🧥 Clothing-taulu
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS clothing (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT,
      category TEXT,
      season TEXT,
      material TEXT,
      color TEXT,
      imageUri TEXT
    );
  `);

  // 👗 Outfits (Opettajan vaatima rakenne: EI items JSON-kenttää)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS outfits (
      id INTEGER PRIMARY KEY NOT NULL,
      style TEXT,
      createdAt TEXT
    );
  `);

  // 🔗 Monesta–moneen taulu: outfit <-> clothing (opettajan vaatima rakenne)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS outfit_clothing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      outfitId INTEGER NOT NULL,
      clothingId INTEGER NOT NULL,
      FOREIGN KEY (outfitId) REFERENCES outfits(id) ON DELETE CASCADE,
      FOREIGN KEY (clothingId) REFERENCES clothing(id) ON DELETE CASCADE
    );
  `);

  // 🟩 Lisätään alkuperäinen clothing-data
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

export default function App() { // 🔥 KORJAA VIIMEINEN VIRHE: export default on oltava tässä
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