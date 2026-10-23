import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials missing in backend .env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Path of the generated map image
const imagePath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\e8f0bb63-b114-4892-81b7-4ccaa3d4684f\\saveetha_hospital_map_1781168279873.png';

async function uploadAndInsert() {
  try {
    if (!fs.existsSync(imagePath)) {
      console.error("❌ Generated map image file not found at:", imagePath);
      return;
    }

    console.log("Reading image file...");
    const fileBuffer = fs.readFileSync(imagePath);

    console.log("Uploading map image to Supabase Storage...");
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('medical-records')
      .upload('usr_1/saveetha_hospital_map.png', fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadErr) {
      if (uploadErr.message?.includes("bucket not found") || uploadErr.message?.includes("does not exist")) {
        console.warn("⚠️ Warning: Storage bucket 'medical-records' does not exist yet. Trying to create it...");
        const { error: bucketErr } = await supabase.storage.createBucket('medical-records', { public: true });
        if (bucketErr) {
          console.error("❌ Failed to create bucket 'medical-records':", bucketErr.message);
          console.error("Please create a public storage bucket named 'medical-records' in your Supabase project dashboard.");
          return;
        }
        // Retry upload
        const { error: retryErr } = await supabase.storage
          .from('medical-records')
          .upload('usr_1/saveetha_hospital_map.png', fileBuffer, {
            contentType: 'image/png',
            upsert: true
          });
        if (retryErr) {
          console.error("❌ Failed to upload on retry:", retryErr.message);
          return;
        }
      } else {
        console.error("❌ Upload failed:", uploadErr.message);
        return;
      }
    }

    console.log("Successfully uploaded to Supabase Storage.");

    const { data: { publicUrl } } = supabase.storage
      .from('medical-records')
      .getPublicUrl('usr_1/saveetha_hospital_map.png');

    console.log("Public URL:", publicUrl);

    console.log("Registering map image record in the database...");
    const { error: dbError } = await supabase
      .from('medical_records')
      .insert({
        id: 'rec_map_' + Date.now(),
        patientId: 'usr_1',
        fileName: 'Saveetha Hospital Route Map.png',
        fileSize: '1.2 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        description: 'Google Maps Directions Route to Saveetha Medical College Hospital',
        fileUrl: publicUrl
      });

    if (dbError) {
      if (dbError.message?.includes("relation") || dbError.message?.includes("does not exist") || dbError.message?.includes("schema cache")) {
        console.error("❌ Database table 'medical_records' not found in your Supabase project.");
        console.error("👉 Please execute schema.sql in your Supabase SQL Editor first, then rerun this script.");
      } else {
        console.error("❌ Database insertion failed:", dbError.message);
      }
    } else {
      console.log("✅ Success! Map image registered as a medical record in the database for patient Vinay Kumar.");
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

uploadAndInsert();
