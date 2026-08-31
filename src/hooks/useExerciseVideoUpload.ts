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
 * Given a public Storage URL like
 * `https://<project>.supabase.co/storage/v1/object/public/exercise-media/<uid>/<uuid>.mp4`
 * return the object path inside the bucket, or null if the URL doesn't belong
 * to this bucket (external YouTube URLs, malformed strings).
 */
export function storagePathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  return url.slice(idx + marker.length);
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

  async function deleteVideoByUrl(url: string | null | undefined): Promise<void> {
    const path = storagePathFromPublicUrl(url);
    if (!path) return;
    // Best-effort: swallow errors so a stale-URL delete never blocks the
    // caller's happy path.
    await supabase.storage.from(BUCKET).remove([path]);
  }

  return { uploadVideo, deleteVideoByUrl, uploading };
}
