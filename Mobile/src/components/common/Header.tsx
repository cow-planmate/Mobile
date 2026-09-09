import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  Animated,
  AccessibilityInfo,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { INITIAL_TAB } from '../../navigation/types';
import UserIcon from 'lucide-react-native/dist/esm/icons/user';
import LogOut from 'lucide-react-native/dist/esm/icons/log-out';
import Bell from 'lucide-react-native/dist/esm/icons/bell';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right';
import { useAuthStore } from '../../store/useAuthStore';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { normalize } from '../../utils/normalize';
import gravatarUrl from '../../utils/gravatarUrl';
import FallbackImage from './FallbackImage';
import Logo from './Logo';
import { tokens } from '../../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const logout = useAuthStore(state => state.logout);
  const { disconnect } = useWebSocket();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    right: 16,
  });
  const profileRef = useRef<View>(null);
  const overlayRef = useRef<View>(null);

  const [reduceMotion, setReduceMotion] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (!cancelled) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (menuVisible) {
      if (reduceMotion) {
        scaleAnim.setValue(1);
        opacityAnim.setValue(1);
        return;
      }
      scaleAnim.setValue(0.96);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.96);
      opacityAnim.setValue(0);
    }
  }, [menuVisible, reduceMotion, scaleAnim, opacityAnim]);

  const positionMenu = (
    originX = 0,
    originY = 0,
    screenWidth = Dimensions.get('window').width,
  ) => {
    profileRef.current?.measureInWindow((pageX, pageY, width, height) => {
      const right = Math.max(
        normalize(16),
        screenWidth - (pageX - originX + width),
      );
      setMenuPosition({
        top: pageY - originY + height + normalize(6),
        right,
      });
      setMenuVisible(true);
    });
  };

  const handleProfilePress = () => positionMenu();

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

  // 로고는 앱의 첫 화면으로 돌아가는 자리다. 입력하던 값을 지우지는 않는다 —
  // 잘못 눌렀을 때 고르던 여행지와 날짜가 사라지면 손해가 크다.
  const handleLogoPress = () => {
    navigation.navigate('MainTabs', { screen: INITIAL_TAB });
  };

  return (
    <View style={[styles.topBar, { paddingTop: normalize(4) + insets.top }]}>
      <TouchableOpacity
        onPress={handleLogoPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 16 }}
        accessibilityRole="button"
        accessibilityLabel="일정 생성으로 이동"
      >
        <Logo width={normalize(95)} height={normalize(21)} />
      </TouchableOpacity>
      <View style={styles.topIcons}>
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.bellButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={
            pendingRequestsCount > 0 ? `알림 ${pendingRequestsCount}건` : '알림'
          }
        >
          <Bell
            size={normalize(22)}
            color={tokens.colors.text}
            strokeWidth={1.6}
          />
          {pendingRequestsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleProfilePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`${nickname || '사용자'}님 메뉴 열기`}
          accessibilityState={{ expanded: menuVisible }}
        >
          <View
            ref={profileRef}
            collapsable={false}
            style={[styles.userAvatar, menuVisible && styles.userAvatarActive]}
          >
            <FallbackImage
              uri={email ? gravatarUrl(email, 100) : null}
              style={styles.avatarImage}
              accessible={false}
              fallback={
                <UserIcon
                  size={normalize(14)}
                  color={tokens.colors.textTertiary}
                />
              }
            />
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
        onShow={() =>
          overlayRef.current?.measureInWindow((x, y, width) =>
            positionMenu(x, y, width),
          )
        }
        onRequestClose={() => setMenuVisible(false)}
      >
        <View
          ref={overlayRef}
          testID="profile-menu-overlay"
          collapsable={false}
          style={styles.modalOverlay}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="프로필 메뉴 닫기"
          />
          <Animated.View
            testID="profile-menu"
            style={[
              styles.dropdownMenu,
              { top: menuPosition.top, right: menuPosition.right },
              reduceMotion
                ? null
                : {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                  },
            ]}
          >
            <View style={styles.accountInfo}>
              <View style={styles.accountAvatar}>
                <FallbackImage
                  uri={email ? gravatarUrl(email, 80) : null}
                  style={styles.avatarImage}
                  accessible={false}
                  fallback={
                    <UserIcon
                      size={normalize(18)}
                      color={tokens.colors.textTertiary}
                    />
                  }
                />
              </View>
              <View style={styles.accountTextGroup}>
                <Text style={styles.accountName} numberOfLines={1}>
                  {nickname || '사용자'}
                </Text>
                {!!email && (
                  <Text style={styles.accountEmail} numberOfLines={1}>
                    {email}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('profile')}
              accessibilityRole="button"
              accessibilityLabel="마이페이지"
              activeOpacity={0.65}
            >
              <View style={styles.menuIcon}>
                <UserIcon size={normalize(18)} color={tokens.colors.primary} />
              </View>
              <Text style={styles.menuText}>마이페이지</Text>
              <ChevronRight
                size={normalize(16)}
                color={tokens.colors.textTertiary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={() => handleMenuItemPress('logout')}
              accessibilityRole="button"
              accessibilityLabel="로그아웃"
              activeOpacity={0.65}
            >
              <View style={[styles.menuIcon, styles.logoutIcon]}>
                <LogOut size={normalize(18)} color={tokens.tones.danger.fg} />
              </View>
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
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
    paddingTop: normalize(4),
    paddingBottom: normalize(4),
    backgroundColor: tokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    zIndex: 10,
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  profileButton: {
    minHeight: normalize(44),
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: normalize(4),
  },
  userAvatar: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    backgroundColor: tokens.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  userAvatarActive: {
    borderColor: tokens.colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  bellButton: {
    minWidth: normalize(44),
    minHeight: normalize(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: normalize(6),
    right: normalize(4),
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
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: tokens.colors.white,
    borderRadius: normalize(20),
    padding: normalize(10),
    width: normalize(260),
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 12,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(14),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    marginBottom: normalize(4),
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.04)',
  },
  accountAvatar: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: '#EEF2F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  accountTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  accountName: {
    fontSize: normalize(15),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    letterSpacing: -0.2,
  },
  accountEmail: {
    marginTop: normalize(2),
    fontSize: normalize(11.5),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: normalize(48),
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(8),
    borderRadius: normalize(12),
    gap: normalize(10),
  },
  menuIcon: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(11),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primaryTint,
  },
  logoutIcon: {
    backgroundColor: tokens.tones.danger.bg,
  },
  menuText: {
    flex: 1,
    fontSize: normalize(14),
    color: tokens.colors.text,
    fontFamily: tokens.fontFamily.medium,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: normalize(4),
    paddingTop: normalize(10),
  },
  logoutText: {
    fontSize: normalize(14),
    color: tokens.tones.danger.fg,
    fontFamily: tokens.fontFamily.medium,
  },
});

export default React.memo(Header);
