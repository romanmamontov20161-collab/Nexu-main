import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Message } from '../types/app';

export const useRealTimeMessages = (chatGroupId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Загрузка истории
  const loadMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_group_id', chatGroupId)
        .order('sent_at', { ascending: true })
        .limit(100);
      
      if (!error) setMessages(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [chatGroupId]);

  useEffect(() => {
    loadMessages();

    // 2. Слушаем новые сообщения (Realtime)
    const channel = supabase
      .channel(`chat:${chatGroupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_group_id=eq.${chatGroupId}`
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as Message];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatGroupId, loadMessages]);

  // Оптимистичное добавление (чтобы сообщение появлялось сразу)
  const addOptimisticMessage = (msg: any) => {
    const tempId = 'temp-' + Date.now();
    const newMsg = { ...msg, id: tempId, sent_at: new Date().toISOString() };
    setMessages(prev => [...prev, newMsg]);
    return tempId;
  };

  const replaceOptimisticMessage = (tempId: string, realMsg: Message) => {
    setMessages(prev => prev.map(m => m.id === tempId ? realMsg : m));
  };

  const removeOptimisticMessage = (tempId: string) => {
    setMessages(prev => prev.filter(m => m.id !== tempId));
  };

  return { messages, isLoading, addOptimisticMessage, replaceOptimisticMessage, removeOptimisticMessage };
};
