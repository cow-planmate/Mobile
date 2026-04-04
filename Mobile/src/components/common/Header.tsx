import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faPen } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { normalize } from '../../utils/normalize';
import gravatarUrl from '../../utils/gravatarUrl';

export interface HeaderProps {
  nickname?: string;
  email?: string;
  pendingRequestsCount?: number;
  onNotificationPress: () => void;
  onNavigateProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({
  nickname,
  email,
  pendingRequestsCount = 0,
  onNotificationPress,
  onNavigateProfile,
}) => {
  return (
    <View style={styles.topBar}>
      <Text style={styles.logo}>planMate</Text>
      <View style={styles.topIcons}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={onNotificationPress}
        >
          <FontAwesomeIcon icon={faPen} color="#FFF" size={16} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.userAvatar} onPress={onNavigateProfile}>
          {email ? (
            <Image
              source={{ uri: gravatarUrl(email, 100) }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <FontAwesomeIcon icon={faUser} size={20} color="#9CA3AF" />
          )}
        </TouchableOpacity>
        <Text style={styles.userNickname}>{nickname || '사용자'}님</Text>
        <TouchableOpacity onPress={onNotificationPress}>
          <FontAwesomeIcon icon={faBell} size={22} color="#000" />
          {pendingRequestsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === 'android' ? normalize(48) : normalize(10),
    paddingBottom: normalize(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logo: {
    fontSize: normalize(22),
    fontFamily: 'Pretendard Variable',
    fontWeight: '800',
    color: '#0047FF',
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  headerIconBtn: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(6),
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userNickname: {
    fontSize: normalize(13),
    fontFamily: 'Pretendard Variable',
    color: '#374151',
    marginLeft: normalize(4),
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Header;
