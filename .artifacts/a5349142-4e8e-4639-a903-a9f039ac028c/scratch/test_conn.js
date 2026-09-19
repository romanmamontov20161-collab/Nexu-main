const { createClient } = require('@supabase/supabase-js');

const url = 'https://jtkewgtvezjukhzbtuxw.supabase.co';
const key = 'sb_publishable_ZmA3d3L0t2NLGLeYbyy7Ew_C18Cd09W';

const supabase = createClient(url, key);

async function test() {
  console.log('Testing connection to:', url);
  try {
    const { data, error } = await supabase.from('chat_groups').select('id').limit(1);
    if (error) {
      console.error('Error:', error.message);
    } else {
      console.log('Success! Data:', data);
    }
  } catch (err) {
    console.error('Crash:', err.message);
  }
}

test();
