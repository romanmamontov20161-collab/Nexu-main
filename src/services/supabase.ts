import { createClient } from '@supabase/supabase-js';

// Пытаемся взять данные из переменных окружения
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Логируем для отладки (сотри это перед публикацией!)
console.log('🔗 Supabase Config Check:');
console.log('URL:', supabaseUrl ? 'OK' : 'MISSING');
console.log('KEY:', supabaseAnonKey ? 'OK (Starts with ' + supabaseAnonKey.substring(0, 5) + '...)' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ОШИБКА: Проверьте файл .env! URL или KEY не найдены.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
