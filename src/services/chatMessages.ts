import { supabase } from './supabase';
import { generateAvatarColor } from './anonymousUser';
import { Message } from '../types/app';

export interface SendMessageParams {
  chatGroupId: string;
  content: string;
  senderType: 'user' | 'anonymous';
  userId?: string;
  userDisplayName?: string;
}

export const sendMessage = async (params: SendMessageParams) => {
  const { chatGroupId, content, senderType, userId, userDisplayName } = params;

  try {
    const messageData = {
      chat_group_id: chatGroupId,
      content: content.trim(),
      sender_type: senderType,
      user_id: senderType === 'user' ? userId : null,
      anonymous_user_id: senderType === 'anonymous' ? userId : null,
      display_name: userDisplayName || 'Аноним',
      avatar_color: generateAvatarColor(userDisplayName || 'Аноним'),
      message_type: 'text',
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: data };
  } catch (error: any) {
    console.error('Ошибка отправки:', error);
    return { success: false, error: error.message };
  }
};
