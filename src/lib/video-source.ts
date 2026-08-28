import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from './youtube';

export type VideoKind = 'youtube' | 'file' | 'none';

export interface ResolvedVideo {
  kind: VideoKind;
  /** URL suitable for the video player — YouTube embed URL, or the raw file URL. */
  playerUrl: string | null;
  /** Thumbnail URL when we can produce one (YouTube). Null for uploaded files. */
  thumbnail: string | null;
}

/**
 * Classify a stored `exercises.video_url` value. Trainers can either paste a
 * YouTube URL or upload a file to Supabase Storage; the same column stores
 * whichever they chose (see the exercise-video-upload memory).
 */
export function resolveVideoSource(url: string | null | undefined): ResolvedVideo {
  if (!url) return { kind: 'none', playerUrl: null, thumbnail: null };

  const youTubeId = extractYouTubeId(url);
  if (youTubeId) {
    return {
      kind: 'youtube',
      playerUrl: getYouTubeEmbedUrl(url),
      thumbnail: getYouTubeThumbnail(url),
    };
  }

  return { kind: 'file', playerUrl: url, thumbnail: null };
}
