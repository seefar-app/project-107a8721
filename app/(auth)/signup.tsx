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
import { Gradients } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { signup, isLoading, authError, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

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
    setLocalError(null);
    if (authError) clearError();
  };

  const handlePinChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    setPin(cleaned);
    setLocalError(null);
    if (authError) clearError();
  };

  const handleConfirmPinChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    setConfirmPin(cleaned);
    setLocalError(null);
    if (authError) clearError();
  };

  const handleSignup = async () => {
    // Clear any previous errors
    setLocalError(null);
    clearError();

    // Validate all fields are filled
    if (!name.trim()) {
      setLocalError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (!phoneNumber.trim()) {
      setLocalError('Please enter your phone number');
      return;
    }

    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length < 11) {
      setLocalError('Please enter a complete phone number');
      return;
    }

    if (!pin.trim() || pin.length !== 4) {
      setLocalError('Please enter a 4-digit PIN');
      return;
    }

    if (!confirmPin.trim() || confirmPin.length !== 4) {
      setLocalError('Please confirm your PIN');
      return;
    }

    if (pin !== confirmPin) {
      setLocalError('PINs do not match');
      return;
    }

    // Convert 4-digit PIN to a password format that meets Supabase requirements (min 6 chars)
    // We'll use the PIN twice to create a 8-character password
    const password = `${pin}${pin}`;

    const success = await signup({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      password: password,
    });

    if (success) {
      router.replace('/(tabs)');
    }
  };

  const displayError = localError || authError;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={Gradients.primary} style={styles.header}>
        <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
          <View style={styles.logoContainer}>
            <Ionicons name="person-add" size={36} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join Brew Rewards and start earning</Text>
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
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setLocalError(null);
                if (authError) clearError();
              }}
              autoCapitalize="words"
              leftIcon="person-outline"
              containerStyle={styles.inputContainer}
            />

            <Input
              label="Email"
              placeholder="john@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setLocalError(null);
                if (authError) clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              containerStyle={styles.inputContainer}
            />

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
              label="Create PIN"
              placeholder="4-digit PIN"
              value={pin}
              onChangeText={handlePinChange}
              keyboardType="number-pad"
              secureTextEntry
              leftIcon="lock-closed-outline"
              maxLength={4}
              containerStyle={styles.inputContainer}
            />

            <Input
              label="Confirm PIN"
              placeholder="Confirm your PIN"
              value={confirmPin}
              onChangeText={handleConfirmPinChange}
              keyboardType="number-pad"
              secureTextEntry
              leftIcon="lock-closed-outline"
              maxLength={4}
              containerStyle={styles.inputContainer}
            />

            {displayError && (
              <View style={[styles.errorContainer, { backgroundColor: colors.errorLight }]}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{displayError}</Text>
              </View>
            )}

            {/* Welcome bonus */}
            <View style={[styles.bonusContainer, { backgroundColor: colors.successLight }]}>
              <Ionicons name="gift" size={20} color={colors.success} />
              <View style={styles.bonusTextContainer}>
                <Text style={[styles.bonusTitle, { color: colors.success }]}>
                  50 Welcome Points!
                </Text>
                <Text style={[styles.bonusSubtitle, { color: colors.success }]}>
                  Start earning rewards immediately
                </Text>
              </View>
            </View>

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={isLoading}
              fullWidth
              icon="checkmark-circle"
              iconPosition="right"
              style={styles.signupButton}
            />

            <Text style={[styles.terms, { color: colors.textMuted }]}>
              By creating an account, you agree to our{' '}
              <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={[styles.loginLink, { color: colors.primary }]}>
                    Sign In
                  </Text>
                </Pressable>
              </Link>
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
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  bonusTextContainer: {
    flex: 1,
  },
  bonusTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  bonusSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  signupButton: {
    marginTop: 8,
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});