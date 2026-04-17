import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useThemeColor';
import { Shadows, Gradients } from '@/constants/Colors';

interface QuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  gradient?: readonly string[];
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const colors = useColors();

  const handlePress = (action: QuickAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action.onPress();
  };

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          onPress={() => handlePress(action)}
          style={({ pressed }) => [
            styles.actionButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <LinearGradient
            colors={action.gradient || Gradients.primary}
            style={[styles.iconContainer, Shadows.md]}
          >
            <Ionicons name={action.icon} size={24} color="#ffffff" />
          </LinearGradient>
          <Text style={[styles.label, { color: colors.text }]}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  actionButton: {
    alignItems: 'center',
    minWidth: 70,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});