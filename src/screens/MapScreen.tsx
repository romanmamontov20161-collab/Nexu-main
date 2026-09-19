import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../types/app';
import { useAuth } from '../hooks/useAuth';
import { ChatGroup, getOrCreateDistrictChat } from '../services/chatGroups';
import { joinChat, trackChatVisit } from '../services/userParticipation';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function MapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [districtChat, setDistrictChat] = useState<ChatGroup | null>(null);
  const [region, setRegion] = useState<{ city: string; district: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const city = await AsyncStorage.getItem('user_city');
        const district = await AsyncStorage.getItem('user_district');
        if (city && district) {
          setRegion({ city, district });
          const chat = await getOrCreateDistrictChat(city, district);
          setDistrictChat(chat);
        } else {
          navigation.replace('Onboarding');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleJoin = async () => {
    if (!districtChat) return;
    try {
      await joinChat(districtChat.id, districtChat.name);
      await trackChatVisit(districtChat.id, districtChat.name);
      navigation.navigate('Chat', {
        chatGroupId: districtChat.id,
        chatName: districtChat.name
      });
    } catch (e) {
      alert('Ошибка входа');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Поиск</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Региональный чат</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0088cc" style={{ marginTop: 40 }} />
        ) : districtChat ? (
          <TouchableOpacity style={styles.card} onPress={handleJoin} activeOpacity={0.8}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>D</Text>
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{districtChat.name}</Text>
                <Text style={styles.cardTime}>сейчас</Text>
              </View>
              <Text style={styles.cardLastMsg} numberOfLines={1}>
                {region?.city}, {region?.district} р-он
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={styles.empty}>Чат временно недоступен</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold' },
  content: { flex: 1 },
  sectionTitle: { fontSize: 14, color: '#0088cc', fontWeight: '600', padding: 15, backgroundColor: '#f5f5f5' },
  card: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center'
  },
  avatarCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#0088cc',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  cardInfo: { flex: 1, marginLeft: 15, borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  cardTime: { fontSize: 13, color: '#999' },
  cardLastMsg: { fontSize: 14, color: '#666', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});
