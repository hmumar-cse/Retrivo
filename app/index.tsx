import { Redirect } from 'expo-router';
import { useApp } from '../src/context/AppContext';

export default function Index() {
  const { isAuthenticated } = useApp();
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />;
}

