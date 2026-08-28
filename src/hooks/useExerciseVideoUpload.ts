import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const BUCKET = 'exercise-media';
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB — pragmatic cap for uploaded clips.

function extractExtension(file: File): string {
  const name = file.name;
  const dot = name.lastIndexOf('.');
  if (dot < 0) return 'mp4';
  return name.slice(dot + 1).toLowerCase();
}

/**
 * Uploads a trainer-provided video file to the exercise-media bucket and
 * returns a public URL suitable for storing in exercises.video_url.
 */
export function useExerciseVideoUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  async function uploadVideo(file: File): Promise<string> {
    if (!user) throw new Error('No autenticado');
    if (file.size > MAX_BYTES) {
      throw new Error(`El archivo supera los ${Math.round(MAX_BYTES / (1024 * 1024))} MB.`);
    }

    setUploading(true);
    try {
      const ext = extractExtension(file);
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type || 'video/mp4', upsert: false });
      if (error) throw error;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  return { uploadVideo, uploading };
}
