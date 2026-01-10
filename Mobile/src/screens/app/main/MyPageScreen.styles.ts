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
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editIcon: {
    fontSize: 20,
    color: COLORS.text,
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  cardIcon: {
    fontSize: 24,
    color: COLORS.text,
    marginRight: 16,
    width: 30,
    textAlign: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  changeButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 62,
  },
  linksContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.placeholder,
    paddingVertical: 12,
  },
  deleteLinkText: {
    color: COLORS.error,
  },
  sectionSeparator: {
    height: 12,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: -20,
    marginVertical: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginTop: 4,
  },
  sectionActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCount: {
    fontSize: 14,
    color: COLORS.placeholder,
    fontWeight: '500',
  },
  sectionCountIcon: {
    fontSize: 14,
  },
  actionButton: {
    marginLeft: 8,
  },
  sectionActionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  itineraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  itineraryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itineraryIcon: {
    fontSize: 24,
  },
  itineraryContent: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  itinerarySubtitle: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  moreButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.placeholder,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
});
