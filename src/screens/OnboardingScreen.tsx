import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../types/app';
import { useAuth } from '../hooks/useAuth';
import { OMSK_REGION_DATA } from '../config/regions';
import { getOrCreateDistrictChat } from '../services/chatGroups';
import { joinChat, trackChatVisit } from '../services/userParticipation';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { completeOnboarding } = useAuth();

  const [cityId, setCityId] = useState<string | null>(null);
  const [districtName, setDistrictName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCity = OMSK_REGION_DATA.find(c => c.id === cityId);

  const handleStart = async () => {
    if (!cityId || !districtName || !selectedCity) return;
    setLoading(true);
    try {
      await AsyncStorage.setItem('user_city', selectedCity.name);
      await AsyncStorage.setItem('user_district', districtName);

      const chat = await getOrCreateDistrictChat(selectedCity.name, districtName);
      await joinChat(chat.id, chat.name);
      await trackChatVisit(chat.id, chat.name);

      await completeOnboarding();
      navigation.replace('Main');
    } catch (e) {
      alert('Ошибка соединения с базой');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <Text style={styles.title}>NexU Омск</Text>
        <Text style={styles.sub}>Местные чаты районов</Text>

        <View style={styles.section}>
          <Text style={styles.label}>1. ВЫБЕРИТЕ РЕГИОН</Text>
          <View style={styles.row}>
            {OMSK_REGION_DATA.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => { setCityId(c.id); setDistrictName(null); }}
                style={[styles.chip, cityId === c.id && styles.activeChip]}
              >
                <Text style={[styles.chipText, cityId === c.id && styles.activeText]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedCity && (
          <View style={styles.section}>
            <Text style={styles.label}>2. ВЫБЕРИТЕ ВАШ РАЙОН</Text>
            <View style={styles.districtGrid}>
              {selectedCity.districts.map(d => (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => setDistrictName(d.name)}
                  style={[styles.dItem, districtName === d.name && styles.activeDItem]}
                >
                  <Text style={[styles.dText, districtName === d.name && styles.activeText]}>{d.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, (!cityId || !districtName) && styles.disabled]}
            onPress={handleStart}
            disabled={loading || !districtName}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>ВОЙТИ В ЧАТЫ</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Auth')} style={styles.authBtn}>
            <Text style={styles.authText}>У меня есть аккаунт (Email)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '900', color: '#0088cc', textAlign: 'center', marginTop: 10 },
  sub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25 },
  section: { marginBottom: 25 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#999', marginBottom: 15, letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 10 },
  chip: { padding: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#f0f2f5' },
  activeChip: { backgroundColor: '#0088cc' },
  chipText: { fontSize: 15, color: '#333', fontWeight: '600' },
  districtGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dItem: { padding: 10, paddingHorizontal: 15, borderRadius: 10, backgroundColor: '#f0f2f5', minWidth: '47%' },
  activeDItem: { backgroundColor: '#4caf50' },
  activeText: { color: '#FFF' },
  dText: { fontSize: 14, color: '#333' },
  footer: { marginTop: 10, gap: 15 },
  btn: { backgroundColor: '#19323C', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  disabled: { opacity: 0.2 },
  authBtn: { alignItems: 'center', padding: 10 },
  authText: { color: '#0088cc', fontWeight: '600' }
});
