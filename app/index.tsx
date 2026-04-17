import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Gradients } from '@/constants/Colors';
import { useAuthStore } from '@/store/useAuthStore';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animate logo
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate text
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Navigate after animation
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading]);

  return (
    <LinearGradient colors={Gradients.primary} style={styles.container}>
      {/* Decorative elements */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="cafe" size={56} color="#2563eb" />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslate }],
          },
        ]}
      >
        <Text style={styles.title}>Brew Rewards</Text>
        <Text style={styles.subtitle}>Earn. Redeem. Enjoy.</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.loadingDots}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: logoOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle3: {
    position: 'absolute',
    top: height * 0.4,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    letterSpacing: 2,
  },
  loadingDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 80,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});