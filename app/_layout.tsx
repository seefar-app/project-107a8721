import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, Gradients } from '@/constants/Colors';

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={Gradients.primary}
          style={styles.loadingGradient}
        >
          <Ionicons name="cafe" size={64} color="#ffffff" />
          <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
        </LinearGradient>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="reward-detail/[id]"
        options={{
          headerShown: true,
          title: 'Reward Details',
          headerTransparent: true,
          headerTintColor: '#ffffff',
          headerBackTitle: 'Back',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="checkout/[id]"
        options={{
          headerShown: true,
          title: 'Checkout',
          presentation: 'modal',
          headerBackTitle: 'Cancel',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <RootLayoutNav />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginTop: 24,
  },
});