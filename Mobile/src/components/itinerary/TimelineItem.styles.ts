import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  error: '#FF3B30',
  lightGray: '#F0F0F5',
};

export const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingLeft: 0,
    alignItems: 'stretch',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    alignItems: 'center',
    overflow: 'hidden',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 0,
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  timeTextEditable: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
  },
});
