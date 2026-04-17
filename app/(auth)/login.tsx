import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useColors } from '@/hooks/useThemeColor';
import { Gradients, Shadows } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { login, isLoading, authError, clearError } = useAuthStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Clear any previous auth errors when component mounts
    clearError();
  }, []);

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length > 0) {
      formatted = '+1 (';
      if (cleaned.length > 1) {
        formatted += cleaned.slice(1, 4);
        if (cleaned.length > 4) {
          formatted += ') ' + cleaned.slice(4, 7);
          if (cleaned.length > 7) {
            formatted += '-' + cleaned.slice(7, 11);
          }
        }
      }
    }
    return formatted;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    if (authError) clearError();
  };

  const handlePinChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    setPin(cleaned);
    if (authError) clearError();
  };

  const handleLogin = async () => {
    const success = await login(phoneNumber, pin);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={Gradients.primary} style={styles.header}>
        <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
          <View style={styles.logoContainer}>
            <Ionicons name="cafe" size={40} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to access your rewards</Text>
        </View>
        <View style={styles.curveContainer}>
          <View style={[styles.curve, { backgroundColor: colors.background }]} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Input
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              leftIcon="call-outline"
              containerStyle={styles.inputContainer}
            />

            <Input
              label="PIN"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChangeText={handlePinChange}
              keyboardType="number-pad"
              secureTextEntry
              leftIcon="lock-closed-outline"
              maxLength={4}
              containerStyle={styles.inputContainer}
            />

            {authError && (
              <View style={[styles.errorContainer, { backgroundColor: colors.errorLight }]}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{authError}</Text>
              </View>
            )}

            <Pressable style={styles.forgotPin}>
              <Text style={[styles.forgotPinText, { color: colors.primary }]}>
                Forgot your PIN?
              </Text>
            </Pressable>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              icon="arrow-forward"
              iconPosition="right"
              style={styles.loginButton}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button
              title="Continue with Apple"
              onPress={() => {}}
              variant="outline"
              fullWidth
              icon="logo-apple"
              style={styles.socialButton}
            />

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable>
                  <Text style={[styles.signupLink, { color: colors.primary }]}>
                    Sign Up
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Demo hint */}
            <View style={[styles.demoHint, { backgroundColor: colors.infoLight }]}>
              <Ionicons name="information-circle" size={16} color={colors.info} />
              <Text style={[styles.demoHintText, { color: colors.info }]}>
                Demo: Use any phone number and PIN: 1234
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 60,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  curveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    overflow: 'hidden',
  },
  curve: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    right: -20,
    height: 60,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  keyboardView: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
    paddingTop: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  forgotPin: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPinText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
  },
  socialButton: {
    marginBottom: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  demoHintText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});