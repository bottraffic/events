import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { api, setSession } from '@/lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [venueName, setVenueName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = async () => {
    setError('');
    if (!venueName || !adminName || !email || password.length < 8) {
      setError('יש למלא את כל השדות (סיסמה לפחות 8 תווים)');
      return;
    }
    setLoading(true);
    try {
      const res = await api('/auth/register-tenant', {
        method: 'POST',
        body: JSON.stringify({ venueName, adminName, email, password }),
      });
      // account is created pending operator approval; if the API returns a
      // session (auto-approved) we sign in, otherwise we show the pending state.
      if (res?.accessToken) {
        await setSession(res.accessToken, res.refreshToken);
        router.replace('/dashboard');
      } else {
        setDone(true);
      }
    } catch (e: any) {
      setError(e.message ?? 'שגיאה ביצירת החשבון');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.card}>
          <Text style={styles.logo}>✓</Text>
          <Text style={styles.title}>הבקשה נשלחה!</Text>
          <Text style={styles.subtitle}>חשבונך נוצר וממתין לאישור מנהל המערכת. נעדכן אותך באימייל ברגע שהחשבון יאושר.</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
            <Text style={styles.buttonText}>חזרה לכניסה</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.card}>
          <Text style={styles.logo}>events360</Text>
          <Text style={styles.subtitle}>פתיחת חשבון לאולם / גן אירועים</Text>

          <Text style={styles.label}>שם האולם</Text>
          <TextInput style={styles.input} value={venueName} onChangeText={setVenueName} placeholder="לדוגמה: אולמי הדר" />
          <Text style={styles.label}>שם מלא</Text>
          <TextInput style={styles.input} value={adminName} onChangeText={setAdminName} />
          <Text style={styles.label}>אימייל</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Text style={styles.label}>סיסמה (8 תווים לפחות)</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={register} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>פתיחת חשבון</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Text style={styles.linkText}>כבר יש לך חשבון? התחברות</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef2ff', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 },
  logo: { fontSize: 30, fontWeight: '800', color: '#6366f1', textAlign: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', textAlign: 'right', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, textAlign: 'right', fontSize: 15 },
  button: { backgroundColor: '#6366f1', borderRadius: 10, paddingVertical: 14, marginTop: 24, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkText: { color: '#6366f1', textAlign: 'center', marginTop: 16, fontSize: 14, fontWeight: '600' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 12 },
});
