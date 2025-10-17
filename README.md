Digitaalinen vaatekaappi
## 🌦️ Säälogiikka ja Weather Code -järjestelmä

Tässä sovelluksessa käytetään **Open-Meteo API:n** tarjoamaa säätietoa, jonka avulla valitaan vaatteita sään mukaan.  
Open-Meteo hyödyntää **WMO Weather Codes** -standardeja (World Meteorological Organization), joissa jokainen numero vastaa tiettyä säätilaa.

Sovellus hakee säätiedot API:sta seuraavasti:

```js
https://api.open-meteo.com/v1/forecast?latitude=<LAT>&longitude=<LON>&current_weather=true


| Weathercode | Kuvaus | Sovelluksen tulkinta |
|--------------|--------|----------------------|
| 0 | Clear sky | sunny ☀️ |
| 1, 2 | Mostly clear, partly cloudy | sunny 🌤️ |
| 3 | Overcast | cloudy ☁️ |
| 45, 48 | Fog, rime fog | cloudy 🌫️ |
| 51, 53, 55 | Drizzle: light, moderate, dense | rainy 🌦️ |
| 56, 57 | Freezing drizzle | cold ❄️ |
| 61, 63, 65 | Rain: slight, moderate, heavy | rainy 🌧️ |
| 66, 67 | Freezing rain | cold ❄️ |
| 71, 73, 75 | Snowfall: slight, moderate, heavy | cold 🌨️ |
| 77 | Snow grains | cold ❄️ |
| 80, 81, 82 | Rain showers: light, moderate, violent | rainy 🌧️ |
| 85, 86 | Snow showers: light, heavy | cold 🌨️ |
| 95 | Thunderstorm | rainy ⚡ |
| 96, 99 | Thunderstorm with hail | cold 🌩️ |