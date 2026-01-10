import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1344FF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1C1C1E',
  placeholder: '#8E8E93',
  border: '#E5E5EA',
  white: '#FFFFFF',
  error: '#FF3B30',
  lightGray: '#F0F2F5',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileIconText: {
    fontSize: 40,
    color: COLORS.placeholder,
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editIcon: {
    fontSize: 18,
    color: COLORS.primary,
    marginLeft: 6,
  },
  infoContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cardIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  changeButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  linksContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 16,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.placeholder,
    textDecorationLine: 'underline',
  },
  deleteLinkText: {
    color: COLORS.error,
  },
});
