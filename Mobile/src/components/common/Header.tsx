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
import { useNavigation } from '@react-navigation/native';
import UserIcon from 'lucide-react-native/dist/esm/icons/user';
import LogOut from 'lucide-react-native/dist/esm/icons/log-out';
import Bell from 'lucide-react-native/dist/esm/icons/bell';
import { useAuthStore } from '../../store/useAuthStore';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { normalize } from '../../utils/normalize';
import gravatarUrl from '../../utils/gravatarUrl';
import FallbackImage from './FallbackImage';
import { tokens } from '../../theme/tokens';

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
  const { disconnect } = useWebSocket();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });
  const profileRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);

  const handleProfilePress = () => {
    profileRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const screenWidth = Dimensions.get('window').width;
      const right = screenWidth - (pageX + width);
      setMenuPosition({
        top: pageY + height + 3,
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
        // 스토리북처럼 WebSocketProvider 밖에서 렌더될 수 있어 존재할 때만 끊는다
        disconnect?.();
        logout();
      }
    }, 150);
  };

  return (
    <View style={styles.topBar}>
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
            <FallbackImage
              uri={email ? gravatarUrl(email, 100) : null}
              style={styles.avatarImage}
              accessible={false}
              fallback={
                <UserIcon size={14} color={tokens.colors.textTertiary} />
              }
            />
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
          <Bell size={25} color="#000" />
          {pendingRequestsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
    paddingTop: normalize(8),
    paddingBottom: normalize(8),
    backgroundColor: tokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
    zIndex: 10,
  },
  logo: {
    fontSize: normalize(22),
    fontFamily: 'Pretendard-Bold',
    fontWeight: '800',
    color: tokens.colors.primary,
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
    backgroundColor: tokens.colors.primaryTint,
    borderColor: '#E0E7FF',
  },
  userAvatar: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: tokens.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
    backgroundColor: tokens.colors.white,
    borderRadius: normalize(16),
    paddingVertical: normalize(8),
    width: normalize(140),
    borderWidth: 1,
    borderColor: tokens.colors.border,
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
    borderTopColor: tokens.colors.borderLight,
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
