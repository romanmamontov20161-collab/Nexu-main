import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signUp, signIn } from '../services/auth';
import { OMSK_REGION_DATA } from '../config/regions';

export default function AuthScreen() {
  const navigation = useNavigation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cityId, setCityId] = useState<string | null>(null);
  const [districtName, setDistrictName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCity = OMSK_REGION_DATA.find(c => c.id === cityId);

  const handleAuth = async () => {
    if (!email || !password) return alert('Заполните Email и пароль');
    if (!isLogin && (!cityId || !districtName)) return alert('Выберите ваш район для регистрации');

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        alert('Успешный вход!');
      } else {
        await signUp(email, password, selectedCity?.name, districtName || undefined);
        alert('Регистрация завершена!');
      }
      navigation.goBack();
    } catch (e: any) {
      alert('Ошибка: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>{isLogin ? 'Вход в NexU' : 'Регистрация'}</Text>
          <View style={{ width: 30 }} />
        </View>

        {!isLogin && (
          <View style={styles.section}>
            <Text style={styles.label}>Выберите район для чата:</Text>
            <View style={styles.row}>
              {OMSK_REGION_DATA.map(c => (
                <TouchableOpacity key={c.id} onPress={() => setCityId(c.id)} style={[styles.chip, cityId === c.id && styles.activeChip]}>
                  <Text style={cityId === c.id && { color: '#FFF' }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedCity && (
              <View style={styles.grid}>
                {selectedCity.districts.map(d => (
                  <TouchableOpacity key={d.id} onPress={() => setDistrictName(d.name)} style={[styles.dItem, districtName === d.name && styles.activeD]}>
                    <Text style={[{ fontSize: 13 }, districtName === d.name && { color: '#FFF' }]}>{d.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Пароль" value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={styles.mainBtn} onPress={handleAuth} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnTxt}>{isLogin ? 'ВОЙТИ' : 'СОЗДАТЬ АККАУНТ'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switch}>
            <Text style={styles.switchTxt}>{isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  back: { fontSize: 30, color: '#0088cc' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  section: { marginBottom: 30 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#999', marginBottom: 15 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  chip: { padding: 10, paddingHorizontal: 15, borderRadius: 10, backgroundColor: '#f0f2f5' },
  activeChip: { backgroundColor: '#0088cc' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dItem: { padding: 8, backgroundColor: '#f0f2f5', borderRadius: 8, minWidth: '48%' },
  activeD: { backgroundColor: '#4caf50' },
  form: { gap: 15 },
  input: { backgroundColor: '#f5f7f9', padding: 18, borderRadius: 15, fontSize: 16 },
  mainBtn: { backgroundColor: '#19323C', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  mainBtnTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  switch: { marginTop: 15, alignItems: 'center' },
  switchTxt: { color: '#0088cc', fontWeight: '600' }
});
