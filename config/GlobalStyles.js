import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const globalStyles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  title: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.medium,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.medium,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.medium,
    marginVertical: theme.spacing.small,
    ...theme.shadow.default,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: theme.spacing.small,
  },
  image: {
    width: 60,
    height: 60,
    margin: 4,
    borderRadius: theme.borderRadius.small,
  },
  savedText: {
    marginVertical: theme.spacing.small,
    color: theme.colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 0.48,
  },

  outfitArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.medium,
    
  },
  mainColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: theme.spacing.medium,
    width: 100,
  },
  accessoryColumn: {
    justifyContent: 'flex-start',
    marginRight: theme.spacing.medium,
  },
  accessoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  outfitItem: {
    marginVertical: theme.spacing.xsmall,
    alignItems: 'center',
  },
  accessoryItem: {
    marginHorizontal: theme.spacing.xsmall,
    alignItems: 'center',
  },
  outfitImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.medium,
  },
  accessoryImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.small,
  },
  outfitLabel: {
    marginTop: theme.spacing.xsmall / 2,
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    marginTop: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
  },

  styleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.medium,
  },
  styleCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.small,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleCircleSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  styleText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  styleTextSelected: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },

  carouselWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white', 
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  carouselList: {
    paddingHorizontal: theme.spacing.medium,
  },
  carouselItem: {
    marginRight: theme.spacing.small,
  },
  carouselImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.small,
  },

  newsListContent: {
    padding: theme.spacing.medium,
  },
  newsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.card,
    marginBottom: theme.spacing.large,
    overflow: 'hidden',
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.border,
  },
  newsTextContainer: {
    padding: theme.spacing.medium,
  },
  newsTitle: {
    fontSize: theme.typography.fontSize.medium,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xsmall,
  },
  newsSource: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.textSecondary,
  },

  addClothing: {
    container: {
      flex: 1,
      padding: theme.spacing.medium,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: theme.spacing.large,
      color: theme.colors.textPrimary,
    },
    imageWrapper: {
      alignItems: 'center',
      marginBottom: theme.spacing.large,
    },
    imagePicker: {
      width: 180,
      height: 180,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: theme.borderRadius.medium,
      resizeMode: 'cover',
    },
    imagePlaceholder: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      textAlign: 'center',
    },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.small,
      padding: 10,
      marginVertical: theme.spacing.small,
      fontSize: 15,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
    },
    dropdownField: {
      width: '100%',
      marginVertical: theme.spacing.small,
    },
    label: {
      fontSize: theme.typography.fontSize.small,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    dropdownButton: {
      padding: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.small,
      backgroundColor: theme.colors.surface,
    },
    saveButton: {
      paddingVertical: 12,
      borderRadius: theme.borderRadius.medium,
      marginTop: theme.spacing.medium,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    saveText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      padding: theme.spacing.large,
    },
    modalBox: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      maxHeight: 250,
    },
    modalItem: {
      padding: theme.spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalItemText: {
      fontSize: theme.typography.fontSize.medium,
      color: theme.colors.textPrimary,
    },
  },

});
