import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { getActiveJoinedChats, JoinedChat } from '../services/userParticipation';
import { supabase } from '../services/supabase';

export default function ChatListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [joinedChats, setJoinedChats] = useState<JoinedChat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const chats = await getActiveJoinedChats();
      setJoinedChats(chats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.clear();
    alert('Вы вышли из системы');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Чаты</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutTxt}>Выйти</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color="#0088cc" style={{ marginTop: 20 }} />
        ) : joinedChats.length > 0 ? (
          joinedChats.map(chat => (
            <TouchableOpacity
              key={chat.id}
              style={styles.card}
              onPress={() => navigation.navigate('Chat' as any, { chatGroupId: chat.id, chatName: chat.name })}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{chat.name.substring(4, 5).toUpperCase()}</Text>
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{chat.name}</Text>
                  <Text style={styles.cardTime}>активен</Text>
                </View>
                <Text style={styles.cardMsg} numberOfLines={1}>Нажмите, чтобы открыть диалог</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTxt}>У вас пока нет чатов</Text>
            <TouchableOpacity style={styles.findBtn} onPress={() => navigation.navigate('Map' as any)}>
              <Text style={styles.findBtnTxt}>Перейти к поиску</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  logoutBtn: { padding: 5 },
  logoutTxt: { color: '#0088cc', fontSize: 16 },
  content: { flex: 1 },
  card: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#4caf50', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  cardInfo: { flex: 1, marginLeft: 15, borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  cardTime: { fontSize: 13, color: '#999' },
  cardMsg: { fontSize: 14, color: '#666', marginTop: 2 },
  emptyBox: { alignItems: 'center', marginTop: 100, padding: 20 },
  emptyTxt: { color: '#999', fontSize: 16, marginBottom: 20 },
  findBtn: { backgroundColor: '#0088cc', padding: 15, paddingHorizontal: 40, borderRadius: 25 },
  findBtnTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
