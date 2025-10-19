// config/theme.js

export const theme = {
  colors: {
    // 🎨 Päävärit
    primary: '#804674', // 💜 Syvä violetti — pääväri (napit, korostukset)
    secondary: '#A86464', // 🌹 Lämmin ruusunruskea — tukiväri (painikkeet, otsikot)
    accent: '#B3E5BE', // 💚 Vaalea vihreä — korostukset, hover-efektit
    highlight: '#F5FFC9', // 💛 Vaalea keltainen — taustakorostukset / valinnat

    // ⚙️ Käyttöliittymävärit
    background: '#FFFFF', // 🪶 Sovelluksen yleinen taustaväri
    surface: '#FFFFFF', // 🧾 Korttien / laatikoiden tausta
    border: '#E0E0E0', // 🔲 Rajaukset ja viivat

    // ✏️ Tekstivärit
    textPrimary: '#2E2E2E', // 🔤 Pääteksti
    textSecondary: '#5C5C5C', // 🔤 Toissijainen teksti
    placeholder: '#9E9E9E', // 💬 Placeholder-teksti (inputit yms.)

    // ⚠️ Tilavärit
    error: '#E57373',
    success: '#81C784',
    warning: '#FFD54F',
  },

  spacing: {
    xsmall: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },

  borderRadius: {
    small: 6,
    medium: 10,
    large: 16,
    card: 12,
  },

  shadow: {
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
  },

  typography: {
    fontFamily: {
      regular: 'System', // vaihdetaan esim. 'Poppins-Regular' tms.
      bold: 'System',
      light: 'System',
    },
    fontSize: {
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 26,
    },
    lineHeight: {
      small: 18,
      medium: 24,
      large: 30,
    },
  },
};
