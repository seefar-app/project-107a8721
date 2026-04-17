import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, G } from 'react-native-svg';
import { useColors } from '@/hooks/useThemeColor';
import { Gradients, Shadows } from '@/constants/Colors';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  userName?: string;
}

// Simple QR-like pattern generator (visual representation)
function generateQRPattern(data: string, gridSize: number = 21) {
  const pattern: boolean[][] = [];
  const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  for (let y = 0; y < gridSize; y++) {
    pattern[y] = [];
    for (let x = 0; x < gridSize; x++) {
      // Position detection patterns (corners)
      const isTopLeftFinder = (x < 7 && y < 7);
      const isTopRightFinder = (x >= gridSize - 7 && y < 7);
      const isBottomLeftFinder = (x < 7 && y >= gridSize - 7);
      
      if (isTopLeftFinder || isTopRightFinder || isBottomLeftFinder) {
        const localX = x < 7 ? x : x - (gridSize - 7);
        const localY = y < 7 ? y : y - (gridSize - 7);
        
        // Outer border
        if (localX === 0 || localX === 6 || localY === 0 || localY === 6) {
          pattern[y][x] = true;
        }
        // Inner square
        else if (localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4) {
          pattern[y][x] = true;
        }
        else {
          pattern[y][x] = false;
        }
      }
      // Data area - pseudo-random based on hash and position
      else {
        const seed = (hash + x * 31 + y * 17) % 100;
        pattern[y][x] = seed < 45;
      }
    }
  }
  
  return pattern;
}

export function QRCodeDisplay({ data, size = 200, userName }: QRCodeDisplayProps) {
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const gridSize = 21;
  const cellSize = size / gridSize;
  const pattern = generateQRPattern(data, gridSize);

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <View style={[styles.qrContainer, { backgroundColor: colors.card }, Shadows.lg]}>
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.qrBackground}
        >
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G>
              {pattern.map((row, y) =>
                row.map((cell, x) =>
                  cell ? (
                    <Rect
                      key={`${x}-${y}`}
                      x={x * cellSize}
                      y={y * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill="#1f2937"
                      rx={1}
                    />
                  ) : null
                )
              )}
            </G>
          </Svg>
          
          {/* Center logo */}
          <View style={styles.centerLogo}>
            <LinearGradient
              colors={Gradients.primary}
              style={styles.logoGradient}
            >
              <Ionicons name="cafe" size={20} color="#ffffff" />
            </LinearGradient>
          </View>
        </LinearGradient>
      </View>

      {/* Scan instruction */}
      <View style={styles.instruction}>
        <Ionicons name="scan-outline" size={18} color={colors.primary} />
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
          Show this code at checkout
        </Text>
      </View>

      {userName && (
        <Text style={[styles.userName, { color: colors.text }]}>
          {userName}
        </Text>
      )}

      {/* Active indicator */}
      <View style={styles.activeIndicator}>
        <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
        <Text style={[styles.activeText, { color: colors.success }]}>
          Active & Ready
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  qrContainer: {
    borderRadius: 24,
    padding: 20,
    ...Shadows.lg,
  },
  qrBackground: {
    borderRadius: 16,
    padding: 12,
    position: 'relative',
  },
  centerLogo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 4,
  },
  logoGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});