import { Text, TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle' | 'caption' | 'link' | 'label';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        styles.default,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'caption' && styles.caption,
        type === 'link' && styles.link,
        type === 'label' && styles.label,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});