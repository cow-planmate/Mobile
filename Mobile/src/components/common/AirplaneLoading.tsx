import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Cloud = ({ 
  style, 
  duration, 
  top, 
  scale = 1, 
  opacity = 0.8,
}: { 
  style?: any, 
  duration: number, 
  top: DimensionValue,
  scale?: number,
  opacity?: number,
}) => {
  const translateX = useSharedValue(SCREEN_WIDTH);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(-SCREEN_WIDTH, {
          duration,
          easing: Easing.linear,
        }),
        withTiming(SCREEN_WIDTH, { duration: 0 })
      ),
      -1,
      false
    );
  }, [duration, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale }],
    top,
    opacity,
  }));

  return (
    <Animated.View style={[styles.cloudBase, animatedStyle, style]}>
      <View style={styles.cloudMain} />
      <View style={styles.cloudTopLeft} />
      <View style={styles.cloudTopRight} />
    </Animated.View>
  );
};

const AirplaneLoading = () => {
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    flyX.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    flyY.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    rotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [flyX, flyY, rotate]);

  const airplaneStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: flyX.value },
      { translateY: flyY.value },
      { rotate: `${rotate.value - 12}deg` }
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Background Clouds */}
      <View style={StyleSheet.absoluteFill}>
        <Cloud duration={8000} top="20%" style={{ width: 120, height: 40 }} />
        <Cloud duration={12000} top="60%" style={{ width: 80, height: 25 }} opacity={0.6} scale={0.8} />
        <Cloud duration={10000} top="80%" style={{ width: 150, height: 45 }} />
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.airplaneContainer, airplaneStyle]}>
          <Svg
            width="128"
            height="128"
            viewBox="0 0 576 512"
            fill="#3B82F6"
          >
            <Path d="M482.3 192c34.2 0 93.7 29 93.7 64c0 36-59.5 64-93.7 64l-116.6 0L265.2 495.9c-5.7 10-16.3 16.1-27.8 16.1l-56.2 0c-10.6 0-18.3-10.2-15.4-20.4l49-171.6L112 320 68.8 377.6c-3 4-8 6.4-13.4 6.4l-42 0c-7.8 0-13.6-7.3-11.7-14.8L35.6 256 1.7 142.8C-.2 135.3 5.6 128 13.4 128l42 0c5.4 0 10.4 2.4 13.4 6.4L112 192l102.9 0-49-171.6C162.9 10.2 170.6 0 181.2 0l56.2 0c11.5 0 22.1 6.2 27.8 16.1L365.7 192l116.6 0z" />
          </Svg>
        </Animated.View>
        
        <Text style={styles.title}>일정 정보를 불러오는 중...</Text>
        <Text style={styles.subtitle}>PlanMate가 당신의 완벽한 여행을 그리고 있어요</Text>
      </View>

      {/* Foreground Clouds */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Cloud duration={6000} top="35%" style={{ width: 200, height: 60 }} opacity={0.95} />
        <Cloud duration={5000} top="65%" style={{ width: 250, height: 75 }} opacity={0.9} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF', // bg-sky-50
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  airplaneContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    marginTop: 32,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151', // text-gray-700
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280', // text-gray-500
    fontWeight: '500',
  },
  cloudBase: {
    position: 'absolute',
    left: 0,
  },
  cloudMain: {
    position: 'absolute',
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  cloudTopLeft: {
    position: 'absolute',
    backgroundColor: 'white',
    width: '40%',
    height: '125%',
    borderRadius: 50,
    top: '-50%',
    left: '12%',
  },
  cloudTopRight: {
    position: 'absolute',
    backgroundColor: 'white',
    width: '55%',
    height: '175%',
    borderRadius: 50,
    top: '-87%',
    right: '12%',
  },
});

export default AirplaneLoading;
