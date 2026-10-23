import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('medical_records').select('*').limit(1);
  if (error) {
    console.error("❌ Error checking table:", error.message);
  } else {
    console.log("✅ Table is available! Records found:", data);
  }
}

check();
