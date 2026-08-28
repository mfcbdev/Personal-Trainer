import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database, PhotoPose } from '../lib/database.types';

export type ProgressPhoto = Database['public']['Tables']['progress_photos']['Row'];

export interface ProgressPhotoWithUrl extends ProgressPhoto {
  signedUrl: string;
}

const BUCKET = 'progress-photos';
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour — long enough for a viewing session.

function extractExtension(file: File): string {
  const name = file.name;
  const dot = name.lastIndexOf('.');
  if (dot < 0) return 'jpg';
  return name.slice(dot + 1).toLowerCase();
}

export function useProgressPhotos(clientIdOverride?: string) {
  const { user } = useAuth();
  const clientId = clientIdOverride ?? user?.id;
  const [photos, setPhotos] = useState<ProgressPhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    const { data } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('client_id', clientId)
      .order('taken_at', { ascending: false });

    const rows = data ?? [];
    if (rows.length === 0) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    const paths = rows.map((r) => r.storage_path);
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
    const byPath = new Map((signed ?? []).map((s) => [s.path ?? '', s.signedUrl ?? '']));

    setPhotos(
      rows.map((r) => ({
        ...r,
        signedUrl: byPath.get(r.storage_path) ?? '',
      })),
    );
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function uploadPhoto(file: File, pose: PhotoPose, takenAt?: string) {
    if (!clientId) throw new Error('No autenticado');
    const ext = extractExtension(file);
    // Path shape: <client_id>/<random>.<ext> — the folder gate keys RLS.
    const filename = `${crypto.randomUUID()}.${ext}`;
    const storagePath = `${clientId}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type || 'image/jpeg', upsert: false });
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase.from('progress_photos').insert({
      client_id: clientId,
      pose,
      storage_path: storagePath,
      taken_at: takenAt ?? new Date().toISOString().slice(0, 10),
    });
    if (insertError) {
      // Best-effort cleanup so we don't leave orphaned files.
      await supabase.storage.from(BUCKET).remove([storagePath]);
      throw insertError;
    }

    await refetch();
  }

  async function deletePhoto(photo: ProgressPhoto) {
    const { error: dbError } = await supabase.from('progress_photos').delete().eq('id', photo.id);
    if (dbError) throw dbError;
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
    await refetch();
  }

  return { photos, loading, refetch, uploadPhoto, deletePhoto };
}
