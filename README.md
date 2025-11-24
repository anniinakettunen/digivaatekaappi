Digitaalinen vaatekaappi

| Komponentti / Ominaisuus                  | Opettajan opettama | Itse opittu (lähdetieto / linkki) |
|------------------------------------------|------------------|----------------------------------|
| React Native peruskomponentit            |  View, Text, Image, Button, FlatList, TouchableOpacity, ImageBackground |                                  |
| React Native Paper                        |  Provider, Card, Button, Text  |                                  |
| Theming + globalStyles.js                 |  Yhtenäinen UI / väriteema     |                                  |
| React Navigation                          |  Stack + Bottom Tabs           |                                  |
| Hooks                                     |  useState, useEffect, useNavigation |                                  |
| Expo Image Picker                          |  Kuvan valinta ja URI tallennus |                                  |
| SQLite (perus)                            |  Taulujen luonti ja yksinkertainen INSERT/SELECT |                                  |
| Relaatiotietokanta outfits-clothing      |                  |  Many-to-many relaatiot; [SQLite Documentation](https://www.sqlite.org/lang.html) |
| JOIN-kyselyt SQLite:ssa                   |                  |  Fetch outfits with join: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| SQLiteProvider & useSQLiteContext         |                  |  Moderni Expo SQLite API: [Expo SQLite Provider](https://docs.expo.dev/versions/latest/sdk/sqlite/#sqliteprovider) |
| Dynamic outfit builder                     |                  |  addToOutfit() logiikka; lähde: itse suunniteltu algoritmi |
| Dynamic chunking (chunkArray)             |                  |  Array split function; lähde: [StackOverflow](https://stackoverflow.com/questions/8495687/split-array-into-chunks) |
| useFocusEffect / navigation.addListener   |                  |  Navigation event listener; [React Navigation](https://reactnavigation.org/docs/function-after-focusing-screen/) |
| SavedStylesScreen logic                    |                  |  Render outfits, edit & delete; itse suunniteltu sovelluksen logiikka |
| Karuselli / horisontaalinen FlatList      |                  |  UI hienosäätö, horisontaalinen scroll; [FlatList Docs](https://reactnative.dev/docs/flatlist) |
| Interaktiiviset tyyli-valinnat            |                  |  Custom component logic, itse suunniteltu |
| Tab-navigoinnin & ikonien customointi     |  |  TabBarActiveTintColor, headerStyle, ikonien tuonti (@expo/vector-icons, lucide-react-native); [React Navigation Bottom Tabs](https://reactnavigation.org/docs/bottom-tab-navigator/) |
| ImageBackground + overlay |  |  Visuaalinen UI[ImageBackground](https://reactnative.dev/docs/imagebackground) |

# Digitaalisen Vaatekaapin Tietoturvallinen Arkkitehtuuri – Tiivistelmä

## Sovelluksen rakenne
Digitaalinen vaatekaappisovellus on toteutettu **React Native** -kehyksellä ja hyödyntää **Expo SQLite** -tietokantaa pysyvään tallennukseen. Arkkitehtuuri on modulaarinen ja sisältää useita näkymiä:
- **HomeScreen**: asujen rakentaminen ja tallennus  
- **AddClothingScreen**: vaatteiden luonti ja muokkaus  
- **ClothingList**: vaatteiden haku ja hallinta  
- **SavedStylesScreen**: tallennettujen asujen selaus  

Tietokantamalli koostuu kolmesta taulusta:
- **clothing**  
- **outfits**  
- **outfit_clothing** (monesta-moneen-suhde: yksi vaate voi kuulua useaan asuun ja yksi asu sisältää useita vaatteita)

---

## SQL-injektion torjunta
**SQL Injection** on tietoturvariski, jossa haitallinen syöte pyrkii muuttamaan kyselyn rakennetta. Tyypillisiä hyökkäyksiä ovat:
- `OR 1=1` -ehdot luvattoman datan saamiseksi  
- **UNION**-hyökkäykset tietojen yhdistämiseksi useista tauluista  
- **DROP TABLE** -komennot taulujen tuhoamiseksi  

Sovellus eliminoi nämä riskit käyttämällä **parametrisoituja kyselyitä** kaikissa näkymissä.  

### Turvallinen toteutus
Expo SQLite -API:n metodit (`db.runAsync`, `db.getAllAsync`, `db.getFirstAsync`) erottavat SQL-komennon ja käyttäjän syötteen. Käyttäjän arvot välitetään erillisinä parametreina (`?`), jolloin ne tulkitaan datana eivätkä voi muuttaa kyselyn logiikkaa.  

Esimerkki ClothingList-näkymästä:
```javascript
query += ' WHERE name LIKE ? OR category LIKE ?';
params = [likeTerm, likeTerm];
const list = await db.getAllAsync(query, params);

## Lähteet
- [W3Schools: SQL Injection](https://www.w3schools.com/sql/sql_injection.asp)  
- [GeeksforGeeks: SQL Injection Union Attacks](https://www.geeksforgeeks.org/ethical-hacking/what-is-sql-injection-union-attacks/)


                                