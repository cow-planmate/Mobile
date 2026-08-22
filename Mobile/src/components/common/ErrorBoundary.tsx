import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';
import { normalize } from '../../utils/normalize';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * 렌더 도중 터진 예외를 받아 복구 화면을 보여준다.
 *
 * 경계가 없으면 화면이 그대로 죽어 사용자가 앱을 다시 켜는 것 말고는
 * 할 수 있는 게 없다. 다시 시도는 하위 트리를 새로 그려 일시적 오류를 넘긴다.
 */
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] 렌더 중 오류:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>문제가 생겼어요</Text>
        <Text style={styles.description}>
          화면을 그리는 중 오류가 났어요.{'\n'}다시 시도해도 같으면 앱을 다시 켜
          주세요.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={this.handleRetry}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="다시 시도"
        >
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(tokens.spacing.l),
    gap: normalize(tokens.spacing.s),
    backgroundColor: tokens.colors.background,
  },
  title: {
    fontSize: normalize(tokens.fontSize.ml),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: normalize(tokens.fontSize.s),
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
    lineHeight: normalize(20),
  },
  retryButton: {
    marginTop: normalize(tokens.spacing.m),
    paddingHorizontal: normalize(28),
    paddingVertical: normalize(13),
    borderRadius: tokens.radius.l,
    backgroundColor: tokens.colors.primary,
  },
  retryText: {
    fontSize: normalize(tokens.fontSize.m),
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.white,
  },
});
