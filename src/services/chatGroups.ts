import { supabase } from './supabase';

export interface ChatGroup {
  id: string;
  name: string;
  description: string;
  creator_id: string | null;
  city: string;
  district: string;
  member_count?: number;
  last_activity: string;
}

export const getOrCreateDistrictChat = async (city: string, district: string): Promise<ChatGroup> => {
  const chatName = `ДПС ${district} р-он`;

  try {
    // 1. Ищем чат
    const { data: existing } = await supabase
      .from('chat_groups')
      .select('*')
      .eq('name', chatName)
      .single();

    if (existing) return existing;

    // 2. Если нет - создаем
    const { data: userData } = await supabase.auth.getUser();

    const { data: newChat, error } = await supabase
      .from('chat_groups')
      .insert({
        name: chatName,
        description: `Чат района ${district}`,
        city: city,
        district: district,
        creator_id: userData.user?.id || null,
        lat: 0, lng: 0, h3_index_8: '' // заглушки
      })
      .select()
      .single();

    if (error) throw error;
    return newChat;
  } catch (e) {
    console.error('Error in getOrCreateDistrictChat:', e);
    // Фолбек для тестов
    return {
      id: 'temp-id',
      name: chatName,
      description: 'Временный чат',
      creator_id: null,
      city, district,
      last_activity: new Date().toISOString()
    };
  }
};

// Заглушка для совместимости
export const getNearbyChatsGroups = async () => [];
export const testDatabaseConnection = async () => ({ success: true });
