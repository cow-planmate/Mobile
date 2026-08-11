import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { User as UserIcon, LogOut } from 'lucide-react-native';
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
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });
  const profileRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);

  const handleProfilePress = () => {
    profileRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const screenWidth = Dimensions.get('window').width;
      const right = screenWidth - (pageX + width);
      setMenuPosition({
        top: pageY + height - insets.top + 3,
        right: Math.max(16, right),
      });
      setMenuVisible(true);
    });
  };

  const handleMenuItemPress = (action: 'profile' | 'logout') => {
    setMenuVisible(false);
    setTimeout(() => {
      if (action === 'profile') {
        if (onNavigateProfile) {
          onNavigateProfile();
        } else {
          navigation.navigate('Profile');
        }
      } else if (action === 'logout') {
        void logout();
      }
    }, 100);
  };

  return (
    <View style={[styles.topBar, { paddingTop: insets.top + normalize(8) }]}>
      <Text style={styles.logo}>planMate</Text>
      <View style={styles.topIcons}>
        <TouchableOpacity
          ref={profileRef}
          style={[styles.profileBadge, menuVisible && styles.profileBadgeActive]}
          onPress={handleProfilePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`${nickname || '사용자'}님 메뉴 열기`}
        >
          <View style={styles.userAvatar}>
            {email ? (
              <FastImage
                source={{ uri: gravatarUrl(email, 100), priority: FastImage.priority.normal }}
                style={{ width: '100%', height: '100%' }}
                resizeMode={FastImage.resizeMode.cover}
                accessible={false}
              />
            ) : (
              <FontAwesomeIcon icon={faUser} size={14} color="#9CA3AF" />
            )}
          </View>
          <Text style={[styles.userNickname, menuVisible && styles.userNicknameActive]}>
            {nickname || '사용자'}님
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.bellButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={
            pendingRequestsCount > 0 ? `알림 ${pendingRequestsCount}건` : '알림'
          }
        >
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
          <View style={[styles.dropdownMenu, { top: menuPosition.top, right: menuPosition.right }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('profile')}
              accessibilityRole="button"
              accessibilityLabel="마이페이지"
            >
              <UserIcon size={16} color="#374151" style={styles.menuIcon} />
              <Text style={styles.menuText}>마이페이지</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={() => handleMenuItemPress('logout')}
              accessibilityRole="button"
              accessibilityLabel="로그아웃"
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
    // paddingTop은 useSafeAreaInsets()로 실제 상태바 높이에 맞춰 인라인으로 채워진다.
    paddingBottom: normalize(8),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    zIndex: 10,
  },
  logo: {
    fontSize: normalize(22),
    fontFamily: 'Pretendard-Bold',
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
    fontFamily: 'Pretendard-Bold',
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: normalize(6),
  },
  userNicknameActive: {
    color: '#1E3A8A',
  },
  bellButton: {
    minWidth: normalize(48),
    minHeight: normalize(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    // 토큰 error(#D92D20)는 iOS 스타일 #FF3B30보다 흰 글자 대비가 높다(4.83:1 vs 3.59:1).
    backgroundColor: '#D92D20',
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
    fontFamily: 'Pretendard-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  dropdownMenu: {
    position: 'absolute',
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
