import { supabase } from './supabase';
import { User } from '../types/app';

export const signUp = async (email: string, password: string, city?: string, district?: string): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: email.split('@')[0],
        selected_city: city,
        selected_district: district,
      }
    }
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Ошибка регистрации');
  
  return {
    id: data.user.id,
    email: email,
    display_name: email.split('@')[0],
    selectedCity: city,
    selectedDistrict: district,
  };
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Ошибка входа');
  
  // Пытаемся получить профиль с полями города и района
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email || '',
    display_name: profile?.display_name || email.split('@')[0],
    selectedCity: profile?.selected_city,
    selectedDistrict: profile?.selected_district,
  };
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      display_name: profile?.display_name || user.email?.split('@')[0] || 'Пользователь',
      selectedCity: profile?.selected_city,
      selectedDistrict: profile?.selected_district,
    };
  } catch (e) {
    return null;
  }
};
