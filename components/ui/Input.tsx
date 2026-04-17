import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  TextInputProps,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useThemeColor';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...props
}: InputProps) {
  const colors = useColors();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const borderColor = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderColor, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColor, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const animatedBorderColor = borderColor.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: error ? colors.error : animatedBorderColor,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primary : colors.textMuted}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          {...props}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { color: colors.text },
            leftIcon && { paddingLeft: 0 },
            (rightIcon || secureTextEntry) && { paddingRight: 0 },
          ]}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setIsSecure(!isSecure)} style={styles.rightIcon}>
            <Ionicons
              name={isSecure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}
        {rightIcon && !secureTextEntry && (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </Animated.View>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
});