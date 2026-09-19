import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useRealTimeMessages } from '../hooks/useRealTimeMessages';
import { sendMessage } from '../services/chatMessages';
import { getOrCreateAnonymousUser } from '../services/anonymousUser';

export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { isAuthenticated, user } = useAuth();
  const { chatGroupId, chatName } = route.params;

  const [input, setInput] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { messages, isLoading, addOptimisticMessage, replaceOptimisticMessage, removeOptimisticMessage } = useRealTimeMessages(chatGroupId);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (isAuthenticated && user) {
          setCurrentUser({ id: user.id, name: user.display_name, type: 'user' });
        } else {
          const anon = await getOrCreateAnonymousUser();
          setCurrentUser({ id: anon.id, name: anon.generated_name, type: 'anonymous' });
        }
      } catch (e) {
        console.error('User load error', e);
      }
    };
    loadUser();
  }, [isAuthenticated, user]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Если пользователь еще не загрузился, пробуем быстро получить его
    let activeUser = currentUser;
    if (!activeUser) {
      const anon = await getOrCreateAnonymousUser();
      activeUser = { id: anon.id, name: anon.generated_name, type: 'anonymous' };
      setCurrentUser(activeUser);
    }

    const content = input.trim();
    setInput('');

    const tempId = addOptimisticMessage({
      content,
      sender_type: activeUser.type,
      display_name: activeUser.name,
    });

    try {
      const result = await sendMessage({
        chatGroupId,
        content,
        senderType: activeUser.type,
        userId: activeUser.type === 'user' ? activeUser.id : undefined,
        userDisplayName: activeUser.name
      });
      if (result.success && result.message) {
        replaceOptimisticMessage(tempId, result.message);
      }
    } catch (e) {
      removeOptimisticMessage(tempId);
      alert('Ошибка при отправке');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{chatName}</Text>
          <Text style={styles.headerStatus}>в сети</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isOwn = (currentUser?.id === (item.user_id || item.anonymous_user_id));
          return (
            <View style={[styles.messageRow, isOwn ? styles.rowOwn : styles.rowOther]}>
              <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                {!isOwn && <Text style={styles.senderName}>{item.display_name}</Text>}
                <Text style={[styles.messageText, isOwn && styles.textOwn]}>{item.content}</Text>
                <Text style={styles.time}>{new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={isLoading ? <ActivityIndicator color="#0088cc" /> : null}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            placeholder="Сообщение"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.7}
          >
            <Text style={styles.sendIcon}>▲</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e6eaed' },
  header: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 35, color: '#0088cc', marginTop: -5 },
  headerInfo: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#000' },
  headerStatus: { fontSize: 13, color: '#0088cc' },

  listContent: { padding: 10, paddingBottom: 20 },
  messageRow: { marginBottom: 10, flexDirection: 'row' },
  rowOwn: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '85%',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    position: 'relative',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  bubbleOwn: { backgroundColor: '#efffde', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },

  senderName: { fontSize: 13, fontWeight: 'bold', color: '#0088cc', marginBottom: 2 },
  messageText: { fontSize: 16, color: '#000', lineHeight: 20 },
  textOwn: { color: '#000' },
  time: { fontSize: 10, color: '#999', alignSelf: 'flex-end', marginTop: 4, marginLeft: 10 },

  inputArea: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#fff',
    fontSize: 16,
    paddingTop: 10,
    paddingBottom: 10
  },
  sendBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#0088cc',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 2
  },
  sendBtnDisabled: { backgroundColor: '#b3d9ff' },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
