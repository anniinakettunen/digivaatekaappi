import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { Image } from 'react-native';
import AppNavigator from './AppNavigator';
import { initialData } from './data/ClothingData';

const initialize = async (db) => {
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

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS outfits (
      id INTEGER PRIMARY KEY NOT NULL,
      style TEXT,
      createdAt TEXT
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS outfit_clothing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      outfitId INTEGER NOT NULL,
      clothingId INTEGER NOT NULL,
      FOREIGN KEY (outfitId) REFERENCES outfits(id) ON DELETE CASCADE,
      FOREIGN KEY (clothingId) REFERENCES clothing(id) ON DELETE CASCADE
    );
  `);

  const countResult = await db.getFirstAsync(
    'SELECT count(id) AS count FROM clothing'
  );
  const count = countResult?.count ?? 0;

  if (count === 0) {
    console.log('Tietokanta on tyhjä, lisätään alkuperäinen data...');
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
    console.log('Alkuperäinen data lisätty onnistuneesti.');
  } else {
    console.log(`Tietokannassa on jo ${count} vaatekappaletta. Alustus skipataan.`);
  }
};

export default function App() {
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
