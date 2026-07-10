import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { User as UserIcon, Users, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
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
  const navigation = useNavigation<any>();
  const logout = useAuthStore((state) => state.logout);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleProfilePress = () => {
    setMenuVisible(true);
  };

  const handleMenuItemPress = (action: 'profile' | 'social' | 'logout') => {
    setMenuVisible(false);
    setTimeout(() => {
      if (action === 'profile') {
        if (onNavigateProfile) {
          onNavigateProfile();
        } else {
          navigation.navigate('Profile');
        }
      } else if (action === 'social') {
        navigation.navigate('Social');
      } else if (action === 'logout') {
        void logout();
      }
    }, 100);
  };

  return (
    <View style={styles.topBar}>
      <Text style={styles.logo}>planMate</Text>
      <View style={styles.topIcons}>
        <TouchableOpacity 
          style={[styles.profileBadge, menuVisible && styles.profileBadgeActive]} 
          onPress={handleProfilePress}
        >
          <View style={styles.userAvatar}>
            {email ? (
              <FastImage
                source={{ uri: gravatarUrl(email, 100), priority: FastImage.priority.normal }}
                style={{ width: '100%', height: '100%' }}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : (
              <FontAwesomeIcon icon={faUser} size={14} color="#9CA3AF" />
            )}
          </View>
          <Text style={[styles.userNickname, menuVisible && styles.userNicknameActive]}>
            {nickname || '사용자'}님
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNotificationPress}>
          <FontAwesomeIcon icon={faBell} size={25} color="#000" />
          {pendingRequestsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 프로필 드롭다운 메뉴 모달 */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuItemPress('profile')}
            >
              <UserIcon size={16} color="#374151" style={styles.menuIcon} />
              <Text style={styles.menuText}>마이페이지</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuItemPress('social')}
            >
              <Users size={16} color="#374151" style={styles.menuIcon} />
              <Text style={styles.menuText}>소셜</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutItem]} 
              onPress={() => handleMenuItemPress('logout')}
            >
              <LogOut size={16} color="#EF4444" style={styles.menuIcon} />
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
    zIndex: 10,
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
    gap: normalize(16),
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  profileBadgeActive: {
    backgroundColor: '#F0F4FF',
    borderColor: '#E0E7FF',
  },
  userAvatar: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userNickname: {
    fontSize: normalize(12),
    fontFamily: 'Pretendard Variable',
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: normalize(6),
  },
  userNicknameActive: {
    color: '#1E3A8A',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    marginTop: Platform.OS === 'ios' ? normalize(44) : Platform.OS === 'android' ? normalize(82) : normalize(60),
    marginRight: normalize(16),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    paddingVertical: normalize(8),
    width: normalize(140),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(16),
  },
  menuIcon: {
    marginRight: normalize(10),
  },
  menuText: {
    fontSize: normalize(13),
    color: '#374151',
    fontWeight: '500',
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: normalize(4),
    paddingTop: normalize(12),
  },
  logoutText: {
    fontSize: normalize(13),
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default React.memo(Header);
