import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { api, setSession } from '@/lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@demo.simcha.io');
  const [password, setPassword] = useState('Demo1234!');
  const [tenantSlug, setTenantSlug] = useState('demo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, tenantSlug }),
      });
      await setSession(res.accessToken, res.refreshToken);
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e.message ?? 'שגיאה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Image source={require('../assets/logo-mark.png')} style={styles.logoImg} resizeMode="cover" />
        <Text style={styles.subtitle}>ניהול אולמות וגני אירועים</Text>

        <Text style={styles.label}>מזהה אולם</Text>
        <TextInput style={styles.input} value={tenantSlug} onChangeText={setTenantSlug} autoCapitalize="none" />
        <Text style={styles.label}>אימייל</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Text style={styles.label}>סיסמה</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={login} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>כניסה</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.link}>אין לך חשבון? פתיחת חשבון חדש</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>דמו: admin@demo.simcha.io / Demo1234!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef2ff', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 },
  logo: { fontSize: 30, fontWeight: '800', color: '#6366f1', textAlign: 'center' },
  logoImg: { width: 104, height: 104, borderRadius: 24, alignSelf: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', textAlign: 'right', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, textAlign: 'right', fontSize: 15 },
  button: { backgroundColor: '#6366f1', borderRadius: 10, paddingVertical: 14, marginTop: 24, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: '#6366f1', textAlign: 'center', marginTop: 16, fontSize: 14, fontWeight: '600' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 12 },
  hint: { color: '#94a3b8', fontSize: 11, textAlign: 'center', marginTop: 16 },
});
