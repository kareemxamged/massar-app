import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    '❌ Missing credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or their VITE_ variants) in your .env file.'
  );
  process.exit(1);
}

const PING_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours
const PING_TABLE = 'profiles';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function humanInterval(ms) {
  const hours = ms / 1000 / 60 / 60;
  return hours === 1 ? 'every 1 hour' : `every ${hours} hours`;
}

async function ping() {
  const timestamp = new Date().toISOString();
  const start = Date.now();

  const { error } = await supabase
    .from(PING_TABLE)
    .select('*', { count: 'exact', head: true });

  const duration = Date.now() - start;

  if (error) {
    console.error(`❌ [${timestamp}] Ping failed in ${duration}ms —`, error.message);
  } else {
    console.log(`✅ [${timestamp}] Ping successful (${duration}ms)`);
  }
}

console.log(`🚀 Keep-alive started`);
console.log(`   Supabase URL : ${SUPABASE_URL}`);
console.log(`   Target table : ${PING_TABLE}`);
console.log(`   Interval     : ${humanInterval(PING_INTERVAL_MS)}`);
console.log('');

ping();
setInterval(ping, PING_INTERVAL_MS);
