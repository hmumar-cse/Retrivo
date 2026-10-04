import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

/**
 * Robust SecureStore adapter for Supabase session persistence
 * conforming to Supabase's SupportedStorage contract.
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isWeb) {
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('SecureStore getItem error:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isWeb) {
        if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch (e) {
      console.warn('SecureStore setItem error:', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (isWeb) {
        if (typeof window !== 'undefined') window.localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('SecureStore deleteItem error:', e);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://retrivo-campus.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldHJpdm8iLCJyb2xlIjoiYW5vbiJ9.placeholder-key';

export const isConfigured = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL &&
    !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('retrivo-campus.supabase.co') &&
    !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('your-project') &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

